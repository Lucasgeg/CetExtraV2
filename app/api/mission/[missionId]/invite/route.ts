import prisma from "@/app/lib/prisma";
import MissionInvitation from "@/components/MailTemplate/MissionInvitation";
import { EnumRole } from "@/store/types";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { MissionInviteBody } from "@/types/MissionInvite";
import { getMissionJobValue } from "@/utils/enum";
import { isEmailValid } from "@/utils/string";
import { auth } from "@clerk/nextjs/server";
import { MissionJob, Prisma } from "@prisma/client";
import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  props: { params: Promise<{ missionId: string }> }
) {
  const { sessionClaims, userId } = await auth();
  const { missionId } = await props.params;

  try {
    const {
      expeditorUserId,
      receiverEmail,
      missionEndDate,
      missionJob,
      missionStartDate
    } = (await req.json()) as MissionInviteBody;

    console.info("Received data for mission invite:", {
      expeditorUserId,
      receiverEmail,
      missionEndDate,
      missionJob,
      missionStartDate
    });

    // Validation des données
    if (!missionId || !expeditorUserId || !receiverEmail || !missionJob) {
      return new Response(
        JSON.stringify({
          message: "Tous les champs obligatoires doivent être renseignés"
        }),
        { status: 400 }
      );
    }

    if (!isEmailValid(receiverEmail)) {
      return new Response(
        JSON.stringify({ message: "L'adresse email n'est pas valide" }),
        { status: 400 }
      );
    }

    if (!missionStartDate || !missionEndDate) {
      return new Response(
        JSON.stringify({
          message: "Les dates de début et de fin sont obligatoires"
        }),
        { status: 400 }
      );
    }

    // Validation des dates
    const startDate = new Date(missionStartDate);
    const endDate = new Date(missionEndDate);
    const now = new Date();

    if (startDate < now) {
      return new Response(
        JSON.stringify({ message: "La date de début doit être dans le futur" }),
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return new Response(
        JSON.stringify({
          message: "La date de début doit être antérieure à la date de fin"
        }),
        { status: 400 }
      );
    }

    // Validation de l'autorisation
    if (
      !sessionClaims ||
      sessionClaims.publicMetadata.role !== EnumRole.COMPANY
    ) {
      return new Response(
        JSON.stringify({
          message: "Seules les entreprises peuvent envoyer des invitations"
        }),
        { status: 403 }
      );
    }

    if (userId !== expeditorUserId) {
      return new Response(
        JSON.stringify({
          message: "Vous n'êtes pas autorisé à effectuer cette action"
        }),
        { status: 403 }
      );
    }

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
          return {
            success: false,
            error:
              "Mission non trouvée ou vous n'êtes pas autorisé à y accéder",
            status: 404
          };
        }

        const userFromDb = await tx.user.findUnique({
          where: { email: receiverEmail },
          select: {
            id: true,
            role: true
          }
        });

        if (userFromDb?.role === "company") {
          return {
            success: false,
            error: "Vous ne pouvez pas inviter une entreprise à une mission",
            status: 403
          };
        }

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
          } catch (error) {
            if (
              error instanceof Error &&
              "code" in error &&
              error.code === "P2002"
            ) {
              return {
                success: false,
                error: "Cette personne est déjà invitée à cette mission",
                status: 409
              };
            }
            console.error("Error creating user mission:", error);
            return {
              success: false,
              error: "Impossible de créer l'invitation pour cet utilisateur",
              status: 500
            };
          }
          try {
            const duration =
              new Date(missionEndDate).getTime() -
              new Date(missionStartDate).getTime();
            const missionInvitation = MissionInvitation({
              companyName: user.company?.company_name,
              isAllreadyRegistered: true,
              duration: duration,
              missionJob: getMissionJobValue(missionJob),
              missionDate: new Date(missionStartDate).toISOString(),
              missionName: user.company.createdMissions[0].name,
              missionLocation:
                user.company.createdMissions[0].missionLocation?.fullName ||
                "Non spécifié",
              receiverEmail: receiverEmail
            });

            await resend.emails.send({
              from: "Cet Extra <no-reply@cetextra.fr>",
              to: [receiverEmail],
              subject: "Invitation à une mission",
              react: missionInvitation,
              text: await render(missionInvitation),
              headers: {
                "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
              }
            });
          } catch (error) {
            console.error("Error sending email to registered user:", error);
            return {
              success: false,
              error:
                "L'invitation a été créée mais l'email n'a pas pu être envoyé",
              status: 500
            };
          }
          return {
            success: true,
            data: { message: "Invitation envoyée avec succès" }
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
            const missionInvitation = MissionInvitation({
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
            });

            await resend.emails.send({
              from: "Cet Extra <no-reply@cetextra.fr>",
              to: [receiverEmail],
              subject: "Invitation à une mission",
              react: missionInvitation,
              text: await render(missionInvitation),
              headers: {
                "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
              }
            });
          } catch (error) {
            if (
              error instanceof Error &&
              "code" in error &&
              error.code === "P2002"
            ) {
              return {
                success: false,
                error: "Cette personne est déjà invitée à cette mission",
                status: 409
              };
            }
            console.error("Error creating invitation or sending email:", error);
            return {
              success: false,
              error:
                "Impossible d'envoyer l'invitation. Veuillez réessayer plus tard",
              status: 500
            };
          }
          return {
            success: true,
            data: { message: "Invitation envoyée avec succès" }
          };
        }
      }
    );

    if (!response.success) {
      throw new ApiError(
        response.error || "Échec du traitement de l'invitation",
        response.status || 500
      );
    }

    return NextResponse.json(response.data, {
      status: 201
    });
  } catch (error) {
    console.error("Error in mission invite API:", error);

    if (error instanceof ApiError) {
      return new NextResponse(JSON.stringify({ message: error.message }), {
        status: error.status
      });
    }

    // Erreur de parsing JSON
    if (error instanceof SyntaxError) {
      return new NextResponse(
        JSON.stringify({ message: "Format de données invalide" }),
        { status: 400 }
      );
    }

    // Erreur générique
    return new NextResponse(
      JSON.stringify({
        message:
          "Une erreur inattendue s'est produite. Veuillez réessayer plus tard"
      }),
      { status: 500 }
    );
  }
}

const createUserMissionFromDb = async (
  body: MissionInviteBody,
  missionId: string,
  userId: string,
  tx: Prisma.TransactionClient
) => {
  return await tx.userMission.create({
    data: {
      userId: userId,
      missionId: missionId,
      missionStartDate: new Date(body.missionStartDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionEndDate: new Date(body.missionEndDate),
      hourlyRate: 0,
      status: "pending"
    }
  });
};

const createUserInvitation = async (
  body: MissionInviteBody,
  missionId: string,
  tx: Prisma.TransactionClient
) => {
  return await tx.invitation.create({
    data: {
      email: body.receiverEmail,
      missionId: missionId,
      missionEndDate: new Date(body.missionEndDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionStartDate: new Date(body.missionStartDate),
      hourlyRate: 0
    }
  });
};
