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

/**
 * Endpoint pour annuler la participation d'un utilisateur à une mission
 *
 * Cette route permet à une entreprise de retirer un extra d'une mission existante.
 * Elle met à jour le statut de la relation UserMission à "cancelled" et envoie un email
 * de notification à l'utilisateur concerné pour l'informer de l'annulation.
 *
 * @route PATCH /api/mission/[missionId]/users/[userId]
 *
 * @param {Request} request - Requête contenant le message d'annulation et le type de poste
 * @param {Object} props - Propriétés de la route Next.js
 * @param {Promise<{missionId: string, userId: string}>} props.params - Paramètres d'URL contenant l'ID de la mission et de l'utilisateur
 *
 * @body {Object} body - Corps de la requête
 * @body {string} body.message - Message explicatif pour l'annulation (raison)
 * @body {MissionJob} body.missionJob - Type de poste de la mission qui est annulé
 *
 * @returns {Promise<NextResponse>} Réponse HTTP avec les détails de l'opération
 *
 * @throws {ApiError} 401 - Si l'utilisateur n'est pas authentifié
 * @throws {ApiError} 400 - Si des paramètres requis sont manquants
 * @throws {ApiError} 403 - Si l'utilisateur n'est pas autorisé à modifier cette mission
 * @throws {ApiError} 404 - Si la mission ou l'utilisateur n'existe pas
 * @throws {ApiError} 500 - En cas d'erreur serveur ou d'échec de l'envoi d'email
 *
 * @security
 * - Nécessite une authentification via Clerk
 * - Seul le créateur de la mission peut effectuer cette action
 *
 * @example
 * // Exemple de requête
 * PATCH /api/mission/123e4567-e89b-12d3-a456-426614174000/users/098f6bcd-4621-3373-8ade-4e832627b4f6
 * Content-Type: application/json
 *
 * {
 *   "message": "La mission a été annulée suite à un changement de planning",
 *   "missionJob": "CHEF_DE_RANG"
 * }
 */

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
              mission.missionStartDate
            ).toLocaleString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            const duration = formatDuration(
              new Date(mission.missionEndDate).getTime() -
                new Date(mission.missionStartDate).getTime()
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
