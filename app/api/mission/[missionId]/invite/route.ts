import prisma from "@/app/lib/prisma";
import MissionInvitation from "@/components/MailTemplate/MissionInvitation";
import { EnumRole } from "@/store/types";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { MissionInviteBody } from "@/types/MissionInvite";
import { getMissionJobKey } from "@/utils/enum";
import { isEmailValid } from "@/utils/string";
import { auth } from "@clerk/nextjs/server";
import { MissionJob, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  props: { params: Promise<{ missionId: string }> }
) {
  const { sessionClaims, userId } = await auth();
  const { missionId } = await props.params;
  const {
    expeditorUserId,
    receiverEmail,
    missionEndDate,
    missionJob,
    missionStartDate
  } = (await req.json()) as MissionInviteBody;

  if (!missionStartDate || missionStartDate < new Date().toISOString()) {
    throw new ApiError("Mission start date must be a valid future date", 400);
  }

  if (
    !sessionClaims ||
    sessionClaims.publicMetadata.role !== EnumRole.COMPANY ||
    userId !== expeditorUserId
  ) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401
    });
  }

  if (
    !missionId ||
    !expeditorUserId ||
    !receiverEmail ||
    !isEmailValid(receiverEmail)
  ) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    const response: TransactionResult = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { clerkId: expeditorUserId },
          select: {
            company: {
              select: {
                createdMissions: {
                  where: {
                    id: missionId
                  },
                  select: {
                    name: true,
                    description: true,
                    mission_start_date: true,
                    mission_end_date: true,
                    missionLocation: {
                      select: {
                        fullName: true
                      }
                    }
                  }
                },
                company_name: true
              }
            }
          }
        });

        if (
          !user?.company?.createdMissions ||
          user.company.createdMissions.length === 0
        ) {
          return { success: false, error: "Mission not found", status: 404 };
        }

        const userFromDb = await tx.user.findUnique({
          where: { email: receiverEmail },
          select: {
            id: true
          }
        });

        if (userFromDb !== null) {
          try {
            await createUserMissionFromDb(
              {
                receiverEmail,
                expeditorUserId,
                missionJob,
                missionStartDate: new Date(missionStartDate).toISOString(),
                missionEndDate: new Date(missionEndDate).toISOString()
              },
              missionId,
              userFromDb.id,
              tx
            );
          } catch {
            return {
              success: false,
              error: "Failed to create user mission",
              status: 500
            };
          }

          try {
            const duration =
              new Date(missionEndDate).getTime() -
              new Date(missionStartDate).getTime();
            await resend.emails.send({
              from: "Cet Extra <no-reply@cetextra.fr>",
              to: [receiverEmail],
              subject: "Invitation à une mission",
              react: MissionInvitation({
                companyName: user.company?.company_name,
                isAllreadyRegistered: true,
                duration: duration, // Duration in milliseconds
                missionJob: missionJob,
                missionDate: new Date(missionStartDate).toISOString(),
                missionName: user.company.createdMissions[0].name,
                missionLocation:
                  user.company.createdMissions[0].missionLocation?.fullName ||
                  "Non spécifié",
                receiverEmail: receiverEmail
              }),
              headers: {
                "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
              }
            });
          } catch {
            return {
              success: false,
              error: "Failed to process invitation",
              status: 500
            };
          }
          return {
            success: true,
            data: { message: "Invitation sent successfully" }
          };
        } else {
          try {
            const userMission = await createUserInvitation(
              {
                receiverEmail,
                expeditorUserId,
                missionJob,
                missionStartDate: new Date(missionStartDate).toISOString(),
                missionEndDate: new Date(missionEndDate).toISOString()
              },
              missionId,
              tx
            );
            console.info("User invitation created:", userMission);
            const duration =
              new Date(missionEndDate).getTime() -
              new Date(missionStartDate).getTime();
            await resend.emails.send({
              from: "Cet Extra <no-reply@cetextra.fr>",
              to: [receiverEmail],
              subject: "Invitation à une mission",
              react: MissionInvitation({
                companyName: user.company?.company_name,
                isAllreadyRegistered: false,
                duration: duration,
                missionJob: missionJob,
                missionDate: new Date(missionStartDate).toISOString(),
                missionName: user.company.createdMissions[0].name,
                missionLocation:
                  user.company.createdMissions[0].missionLocation?.fullName ||
                  "Non spécifié",
                receiverEmail: receiverEmail
              }),
              headers: {
                "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
              }
            });
          } catch {
            // console.error("Error sending email:", error);
            return {
              success: false,
              error: "Failed to send invitation email",
              status: 500
            };
          }
          return {
            success: true,
            data: { message: "Invitation sent successfully" }
          };
        }
      }
    );
    if (!response.success) {
      throw new ApiError(
        response.error || "Failed to process invitation",
        response.status || 500
      );
    }
    return NextResponse.json(response, {
      status: 201
    });
  } catch (error) {
    // console.error("Error in mission invite API:", error);
    if (error instanceof ApiError) {
      console.error("ApiError details:", {
        message: error.message,
        status: error.status,
        stack: error.stack
      });
      return new NextResponse(
        JSON.stringify({ message: error.message || "Internal server error" }),
        {
          status: error.status || 500
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({ message: "Internal server error" }),
        {
          status: 500
        }
      );
    }
  }
}

const createUserMissionFromDb = async (
  body: MissionInviteBody,
  missionId: string,
  userId: string,
  tx: Prisma.TransactionClient
) => {
  const missionJobKey = getMissionJobKey(
    body.missionJob
  ).toLowerCase() as MissionJob;

  return await tx.userMission.create({
    data: {
      userId: userId,
      missionId: missionId,
      missionStartDate: new Date(body.missionStartDate),
      missionJob: missionJobKey,

      missionEndDate: new Date(body.missionEndDate),
      hourly_rate: 0,
      status: "pending"
    }
  });
};

const createUserInvitation = async (
  body: MissionInviteBody,
  missionId: string,
  tx: Prisma.TransactionClient
) => {
  const missionJobKey = getMissionJobKey(
    body.missionJob
  ).toLowerCase() as MissionJob;

  return await tx.invitation.create({
    data: {
      email: body.receiverEmail,
      missionId: missionId,
      missionEndDate: new Date(body.missionEndDate),
      missionJob: missionJobKey,
      missionStartDate: new Date(body.missionStartDate),
      hourlyRate: 0
    }
  });
};
