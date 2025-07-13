import prisma from "@/app/lib/prisma";
import CancelUserMision from "@/components/MailTemplate/CancelUserMission";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { MissionRemoveUserBody } from "@/types/MissionRemoveUser.body";
import { formatDuration } from "@/utils/date";
import { getMissionJobValue } from "@/utils/enum";
import { auth } from "@clerk/nextjs/server";
import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Prisma } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: Request,
  props: { params: Promise<{ missionId: string; userId: string }> }
) {
  const { userId: clerkId } = await auth();
  const { missionId, userId } = await props.params;
  const { message, missionJob } =
    (await request.json()) as MissionRemoveUserBody;

  if (!clerkId) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!missionId || !userId) {
    throw new ApiError("Mission ID and User ID are required", 400);
  }

  try {
    const response: TransactionResult = await prisma.$transaction(
      async (prisma) => {
        try {
          // Vérification de l'existence de la mission
          const mission = await prisma.mission.findUnique({
            where: { id: missionId },
            include: {
              creator: {
                select: {
                  user: true,
                  company_name: true
                }
              },
              missionLocation: {
                select: {
                  fullName: true
                }
              },
              employees: {
                where: {
                  missionId
                },
                select: {
                  user: {
                    select: {
                      email: true,
                      id: true
                    }
                  }
                }
              }
            }
          });

          if (!mission) {
            return {
              success: false,
              error: "Mission not found",
              status: 404
            };
          }

          // Vérification que le clerkId correspond au créateur de la mission
          if (mission.creator.user.clerkId !== clerkId) {
            return {
              success: false,
              error: "Unauthorized to remove user from this mission",
              status: 403
            };
          }

          // Vérification de l'existence de l'utilisateur dans la mission
          const user = mission.employees.find(
            (employee) => employee.user.id === userId
          );

          if (!user) {
            return {
              success: false,
              error: "User not found in this mission",
              status: 404
            };
          }

          try {
            const data = await prisma.userMission.update({
              where: {
                userId_missionId: {
                  userId,
                  missionId
                }
              },
              data: {
                status: "cancelled"
              }
            });

            const missionDate = new Date(
              mission.mission_start_date
            ).toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            const duration = formatDuration(
              new Date(mission.mission_end_date).getTime() -
                new Date(mission.mission_start_date).getTime()
            );

            const cancelUserMissionEmail = CancelUserMision({
              companyName: mission.creator.company_name,
              missionName: mission.name,
              missionLocation:
                mission.missionLocation?.fullName || "Aucun lieu spécifié",
              missionJob: getMissionJobValue(missionJob),
              duration,
              missionDate,
              refusalReason: message
            });

            try {
              await resend.emails.send({
                from: "Cet Extra <no-reply@cetextra.fr>",
                to: [user.user.email],
                subject: "Annulation d'une mission",
                react: cancelUserMissionEmail,
                text: await render(cancelUserMissionEmail),
                headers: {
                  "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
                }
              });
            } catch (emailError) {
              console.error("Email sending error:", emailError);
              return {
                success: false,
                error: "Failed to send cancellation email",
                status: 500
              };
            }

            return {
              success: true,
              data
            };
          } catch (deleteError) {
            console.error("Delete operation error:", deleteError);

            if (deleteError instanceof Prisma.PrismaClientKnownRequestError) {
              if (deleteError.code === "P2025") {
                return {
                  success: false,
                  error: "User assignment not found",
                  status: 404
                };
              }
            }

            return {
              success: false,
              error: "Failed to remove user from mission",
              status: 500
            };
          }
        } catch (prismaError) {
          console.error("Prisma transaction error:", prismaError);

          if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
            return {
              success: false,
              error: `Database error: ${prismaError.message}`,
              status: 500
            };
          }

          if (prismaError instanceof Prisma.PrismaClientUnknownRequestError) {
            return {
              success: false,
              error: "Unknown database error",
              status: 500
            };
          }

          return {
            success: false,
            error: "Database operation failed",
            status: 500
          };
        }
      }
    );

    if (!response.success) {
      throw new ApiError(
        response.error || "Unhandled error happened",
        response.status
      );
    }
    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
