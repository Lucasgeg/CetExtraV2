import prisma from "@/app/lib/prisma";
import MissionInvitation from "@/components/MailTemplate/MissionInvitation";
import { EnumRole } from "@/store/types";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { GetMissionInvitesResponse } from "@/types/GetMissionIdInvites";
import { InviteListDelete } from "@/types/InviteListDelete";
import { MissionInviteBody } from "@/types/MissionInvite";
import { getMissionJobValue } from "@/utils/enum";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { isEmailValid } from "@/utils/string";
import { auth } from "@clerk/nextjs/server";
import { MissionJob, Prisma } from "@prisma/client";
import { render } from "@react-email/components";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @function POST
 * @async
 * @description
 * Endpoint permettant à une entreprise d'inviter un utilisateur à une mission.
 * Gère la validation des données, la vérification des autorisations, la création de l'invitation
 * (soit pour un utilisateur déjà inscrit, soit pour un nouvel utilisateur), et l'envoi d'un email d'invitation.
 *
 * - Vérifie que l'utilisateur authentifié est bien une entreprise et l'expéditeur de l'invitation.
 * - Valide les champs obligatoires et le format des dates et de l'email.
 * - Si l'utilisateur existe déjà, crée une entrée dans `userMission`, sinon crée une invitation.
 * - Envoie un email d'invitation via Resend avec un template personnalisé.
 * - Gère les erreurs courantes (utilisateur déjà invité, mission non trouvée, etc.).
 *
 * @param {Request} req - La requête HTTP contenant le corps de l'invitation.
 * @param {Object} props - Les paramètres de la requête, incluant l'identifiant de la mission.
 * @param {Promise<{ missionId: string }>} props.params - Paramètres contenant l'identifiant de la mission.
 *
 * @returns {Promise<Response>}
 * Retourne une réponse HTTP avec le statut et un message indiquant le succès ou la raison de l'échec.
 *
 * @throws {ApiError} - En cas d'erreur métier ou de validation.
 * @throws {Prisma.PrismaClientKnownRequestError} - En cas d'erreur lors de l'accès à la base de données.
 * @throws {SyntaxError} - Si le corps de la requête n'est pas un JSON valide.
 */
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
                    missionStartDate: true,
                    missionEndDate: true,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(
        "Prisma error in mission invite API:",
        error.code,
        error.message,
        error.meta
      );
    } else {
      console.error("Error in mission invite API:", error);
    }

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

/**
 * Handles GET requests to retrieve pending employee invites and invitations for a specific mission.
 *
 * @param request - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the missionId.
 * @returns {Promise<NextResponse<GetMissionInvitesResponse | { message: string }>>}
 *
 * @remarks
 * - Only users with the `COMPANY` role and a valid userId are authorized to access this endpoint.
 * - Returns a 401 Unauthorized response if the user is not authorized.
 * - Returns a 400 Bad Request response if the missionId parameter is invalid.
 * - Returns a 404 Not Found response if the mission does not exist.
 * - On success, returns a 200 OK response with counts and details of pending employees and invitations.
 *
 * @example
 * {{baseUrl}}/api/missions/{missionId}/invites
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<GetMissionInvitesResponse | { message: string }>> {
  const { sessionClaims, userId } = await auth();

  if (sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { missionId } = await props.params;

  if (!missionId || typeof missionId !== "string") {
    return NextResponse.json(
      { message: "Invalid missionId parameter" },
      { status: 400 }
    );
  }

  const pendingInvites = await prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      employees: {
        where: {
          status: "pending"
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              email: true,
              extra: {
                select: {
                  first_name: true,
                  last_name: true
                }
              },
              profilePictureUrl: true
            }
          },
          missionJob: true,
          missionStartDate: true,
          missionEndDate: true
        }
      },
      invitations: {
        where: {
          status: "pending"
        },
        select: {
          id: true,
          email: true,
          missionJob: true,
          missionStartDate: true,
          missionEndDate: true
        }
      },
      _count: {
        select: {
          employees: {
            where: {
              missionId,
              status: "pending"
            }
          },
          invitations: {
            where: {
              missionId,
              status: "pending"
            }
          }
        }
      }
    }
  });
  if (!pendingInvites) {
    return NextResponse.json({ message: "Mission not found" }, { status: 404 });
  }
  const response: GetMissionInvitesResponse = {
    counts: {
      employees: pendingInvites._count.employees,
      invitations: pendingInvites._count.invitations,
      total: pendingInvites._count.employees + pendingInvites._count.invitations
    },
    pendingEmployees: pendingInvites.employees.map((employee) => ({
      id: employee.id,
      missionEndDate: employee.missionEndDate.toISOString(),
      missionStartDate: employee.missionStartDate.toISOString(),
      missionJob: employee.missionJob,
      user: {
        id: employee.user.id,
        email: employee.user.email,
        firstName: employee.user.extra?.first_name || null,
        lastName: employee.user.extra?.last_name || null,
        profilePictureUrl: employee.user.profilePictureUrl || null
      }
    })),
    invitations: pendingInvites.invitations.map((invite) => ({
      id: invite.id,
      email: invite.email,
      missionJob: invite.missionJob,
      missionStartDate: invite.missionStartDate.toISOString(),
      missionEndDate: invite.missionEndDate.toISOString()
    }))
  };
  return NextResponse.json(response, { status: 200 });
}

/**
 * Handles the DELETE request for removing employees and/or invites from a mission.
 *
 * This endpoint is restricted to users with the COMPANY role and requires authentication.
 * It expects a JSON body containing arrays of employee and invite IDs to be cancelled.
 * The function performs authorization checks, validates input, and updates the status
 * of the specified employees and invites to "cancelled" within a database transaction.
 *
 * @param request - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the missionId.
 * @returns A NextResponse object with a JSON payload indicating the result of the operation.
 *
 * @throws {401} If the user is not authorized or not a company.
 * @throws {400} If the missionId parameter or request body is invalid.
 * @throws {404} If the creator's company is not found.
 * @throws {500} For unexpected errors or database failures.
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<{ message: string }>> {
  const { sessionClaims, userId } = await auth();

  if (sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY || !userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { missionId } = await props.params;

  if (!missionId || typeof missionId !== "string") {
    return NextResponse.json(
      { message: "Invalid missionId parameter" },
      { status: 400 }
    );
  }

  const body = (await request.json()) as InviteListDelete;
  if (!body || !Array.isArray(body.employees) || !Array.isArray(body.invites)) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  if (body.employees.length === 0 && body.invites.length === 0) {
    return NextResponse.json(
      { message: "No employees or invites to delete" },
      { status: 400 }
    );
  }

  const creator = await prisma.user.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      company: {
        select: {
          id: true,
          user: {
            select: {
              clerkId: true
            }
          }
        }
      }
    }
  });

  if (!creator?.company?.id) {
    return new NextResponse(JSON.stringify({ message: "Creator not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (creator.company.user.clerkId !== userId) {
    return NextResponse.json(
      { message: "You are not authorized to delete invites for this mission" },
      { status: 401 }
    );
  }

  try {
    const response = await prisma.$transaction(async (tx) => {
      if (body.employees.length > 0) {
        await tx.userMission.updateMany({
          where: {
            missionId,
            id: {
              in: body.employees
            }
          },
          data: {
            status: "cancelled"
          }
        });
      }
      if (body.invites.length > 0) {
        await tx.invitation.updateMany({
          where: {
            missionId,
            id: {
              in: body.invites
            }
          },
          data: {
            status: "cancelled"
          }
        });
      }
      return { success: true };
    });
    return NextResponse.json(
      {
        message: response.success
          ? "Invites deleted successfully"
          : "Failed to delete invites"
      },
      { status: response.success ? 200 : 500 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const { message, status } = handlePrismaError(error, "DELETE invites");
      console.error("Error deleting invites:", message, status);
      return NextResponse.json({ message }, { status });
    } else {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
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
  return await tx.userMission.upsert({
    where: {
      userId_missionId: {
        userId,
        missionId
      }
    },
    create: {
      userId,
      missionId,
      missionStartDate: new Date(body.missionStartDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionEndDate: new Date(body.missionEndDate),
      hourlyRate: 0,
      status: "pending"
    },
    update: {
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
  return await tx.invitation.upsert({
    where: {
      email_missionId: {
        email: body.receiverEmail,
        missionId: missionId
      }
    },
    create: {
      email: body.receiverEmail,
      missionId: missionId,
      missionEndDate: new Date(body.missionEndDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionStartDate: new Date(body.missionStartDate),
      hourlyRate: 0,
      status: "pending"
    },
    update: {
      email: body.receiverEmail,
      missionId: missionId,
      missionEndDate: new Date(body.missionEndDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionStartDate: new Date(body.missionStartDate),
      hourlyRate: 0,
      status: "pending"
    }
  });
};
