import prisma from "@/app/lib/prisma";
import CancelUserMision from "@/components/MailTemplate/CancelUserMission";
import { MissionCancellationApiRequest } from "@/types/MissionCancellation";
import { auth } from "@clerk/nextjs/server";
import { MissionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse> {
  const { userId: clerkId } = await auth();
  const { missionId } = await props.params;
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!missionId) {
    return new NextResponse("Mission ID is required", { status: 400 });
  }

  const { message } = (await request.json()) as MissionCancellationApiRequest;
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      creator: {
        select: {
          user: {
            select: {
              clerkId: true
            }
          },
          company_name: true
        }
      },
      employees: {
        where: {
          missionId,
          status: "accepted"
        },
        select: {
          missionStartDate: true,
          user: {
            select: {
              email: true,
              extra: {
                select: {
                  first_name: true,
                  last_name: true
                }
              }
            }
          }
        }
      },
      missionLocation: {
        select: {
          fullName: true
        }
      }
    }
  });

  if (clerkId !== mission?.creator.user.clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!mission) {
    return new NextResponse("Mission not found", { status: 404 });
  }

  if (mission.status === MissionStatus.cancelled) {
    return new NextResponse("Mission already cancelled", { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.mission.update({
        where: {
          id: missionId
        },
        data: {
          status: MissionStatus.cancelled
        }
      }),
      prisma.userMission.updateMany({
        where: {
          missionId
        },
        data: {
          status: MissionStatus.cancelled
        }
      })
    ]);
  } catch (error) {
    if (error instanceof Error) console.error("Error updating mission:", error);
    return NextResponse.json(
      { error: "Failed to cancel mission" },
      { status: 500 }
    );
  }

  try {
    const users = mission.employees.map((employee) => ({
      email: employee.user.email,
      firstName: employee.user.extra?.first_name || "",
      lastName: employee.user.extra?.last_name || ""
    }));

    if (users.length === 0) {
      return new NextResponse("No users to notify", { status: 200 });
    }

    const generateCancelUserMissionEmail = (
      firstName: string,
      lastName: string
    ) => {
      return CancelUserMision({
        companyName: mission.creator.company_name,
        missionName: mission.name,
        missionLocation:
          mission.missionLocation?.fullName || "Aucun lieu spécifié",
        missionDate: mission.employees[0].missionStartDate.toUTCString(),
        refusalReason: message,
        firstName,
        lastName
      });
    };

    // pas de plain text pour les emails envoyés en masse car il faudrait un promise.all
    const batch = users.map((user) => ({
      from: "Cet Extra <no-reply@cetextra.fr>",
      to: user.email,
      subject: "Annulation d'une mission",
      react: generateCancelUserMissionEmail(user.firstName, user.lastName),
      headers: {
        "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
      }
    }));
    await resend.batch.send(batch);
  } catch (error) {
    if (error instanceof Error)
      console.error("Error sending cancellation emails:", error);
    return new NextResponse("Failed to send cancellation emails", {
      status: 500
    });
  }
  // Here you can handle the cancellation logic, e.g., updating the database
  return new NextResponse("Mission cancelled", { status: 200 });
}
