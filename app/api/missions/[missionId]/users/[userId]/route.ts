import { auth } from "@clerk/nextjs/server";
import { UserMissionStatus } from "@prisma/client";
import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/app/lib/prisma";
import CancelUserMision, {
  type CancelUserMisionProps
} from "@/components/MailTemplate/CancelUserMission";
import { EnumRole, type PrismaMissionJob } from "@/store/types";
import { formatDuration } from "@/utils/date";
import {
  canCompanyRemoveEngagement,
  getMissionRemovalBlocker,
  MISSION_CANCELLATION_MESSAGE_MAX_LENGTH
} from "@/utils/engagement.util";
import { convertToFrontendMissionJob } from "@/utils/enum";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Corps accepté : `{ message?, missionJob? }`. `missionJob` (envoyé par le
 * front) est ignoré : le poste de l'email est lu sur l'engagement en base.
 */
const parseBody = (body: unknown): { message: string | undefined } | string => {
  if (typeof body !== "object" || body === null) {
    return "Corps de requête invalide";
  }
  const { message } = body as Record<string, unknown>;

  if (
    message !== undefined &&
    message !== null &&
    typeof message !== "string"
  ) {
    return "Le motif doit être une chaîne de caractères";
  }
  const trimmed = typeof message === "string" ? message.trim() : "";
  if (trimmed.length > MISSION_CANCELLATION_MESSAGE_MAX_LENGTH) {
    return `Le motif ne doit pas dépasser ${MISSION_CANCELLATION_MESSAGE_MAX_LENGTH} caractères`;
  }
  return { message: trimmed || undefined };
};

const formatMissionDate = (date: Date) =>
  date.toLocaleString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    // Les serveurs (Vercel) tournent en UTC : sans fuseau explicite, l'heure
    // affichée serait décalée pour l'extra
    timeZone: "Europe/Paris"
  });

type RemovalOutcome =
  | { ok: false; status: number; message: string }
  | {
      ok: true;
      result: { id: string; status: UserMissionStatus };
      email: { to: string; props: CancelUserMisionProps };
    };

/**
 * Retrait d'un membre de l'équipe par l'entreprise
 * (UserMission `accepted` → `cancelled`), avec email à l'extra.
 *
 * - Réservé au rôle `company` (401) ; `userId` est l'id interne (User.id) de
 *   l'extra.
 * - Body : `{ message?, missionJob? }` — motif optionnel (≤ 500 caractères,
 *   transmis par email, non stocké) ; `missionJob` est ignoré.
 * - Ordre des contrôles : 401 → 400 → 404 (mission absente) → 403 (mission
 *   d'une autre entreprise) → 404 (engagement absent sur cette mission) → 409
 *   (mission annulée ou terminée — `getMissionRemovalBlocker` ; une mission
 *   déjà commencée reste permise) → 409
 *   (engagement non `accepted` : une invitation `pending` s'annule via les
 *   routes d'invitation, une candidature `requested` se refuse via la décision
 *   sur candidature — `canCompanyRemoveEngagement`, utils/engagement.util.ts).
 *   La propriété est vérifiée avant l'engagement : une autre entreprise reçoit
 *   toujours 403 et ne peut pas déduire qui est engagé sur la mission.
 * - Concurrence : propriété vérifiée sans verrou (le créateur ne change pas),
 *   puis la mission est verrouillée `FOR SHARE` (contre une annulation
 *   simultanée) et la ligne UserMission `FOR UPDATE`, avant la lecture des
 *   statuts.
 * - Messages d'erreur en français : le front les affiche tels quels.
 * - L'email est envoyé APRÈS commit et n'est pas bloquant : le retrait
 *   enregistré fait foi, un échec d'envoi est seulement journalisé.
 *
 * @route PATCH /api/missions/[missionId]/users/[userId]
 * @returns 200 avec `{ id, status }` (UserMission), ou 400/401/403/404/409.
 */
export async function PATCH(
  request: Request,
  props: { params: Promise<{ missionId: string; userId: string }> }
) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { missionId, userId } = await props.params;
    if (!missionId || !userId) {
      return NextResponse.json(
        { message: "Identifiants de mission et d'extra requis" },
        { status: 400 }
      );
    }

    const parsed = parseBody(await request.json().catch(() => null));
    if (typeof parsed === "string") {
      return NextResponse.json({ message: parsed }, { status: 400 });
    }

    const outcome = await prisma.$transaction(
      async (tx): Promise<RemovalOutcome> => {
        // Propriété AVANT l'existence de l'engagement et avant tout verrou :
        // une autre entreprise ne doit ni sonder les engagements d'une mission
        // (403 dans tous les cas), ni verrouiller ses lignes. Le créateur
        // d'une mission ne change jamais : cette lecture hors verrou suffit
        const owner = await tx.mission.findUnique({
          where: { id: missionId },
          select: {
            creator: { select: { user: { select: { clerkId: true } } } }
          }
        });

        if (!owner) {
          return { ok: false, status: 404, message: "Mission introuvable" };
        }

        if (owner.creator.user.clerkId !== clerkId) {
          return {
            ok: false,
            status: 403,
            message:
              "Vous n'êtes pas autorisé à modifier l'équipe de cette mission"
          };
        }

        // Verrou partagé de la mission puis verrou de l'engagement : même
        // ordre que l'annulation de mission (Mission FOR UPDATE puis
        // engagements), le statut de la mission lu ici reste donc valable
        // jusqu'au commit
        await tx.$queryRaw`
          SELECT id FROM "Mission" WHERE id = ${missionId} FOR SHARE`;

        const mission = await tx.mission.findUniqueOrThrow({
          where: { id: missionId },
          select: {
            name: true,
            status: true,
            missionLocation: { select: { fullName: true } },
            creator: { select: { company_name: true } }
          }
        });

        // Verrou de l'engagement : un retrait et une autre transition
        // simultanés (double clic, annulation de la mission) s'exécutent
        // l'un après l'autre
        await tx.$queryRaw`
          SELECT id FROM "UserMission"
          WHERE "userId" = ${userId} AND "missionId" = ${missionId}
          FOR UPDATE`;

        const engagement = await tx.userMission.findUnique({
          where: { userId_missionId: { userId, missionId } },
          select: {
            id: true,
            status: true,
            missionJob: true,
            missionStartDate: true,
            missionEndDate: true,
            user: {
              select: {
                email: true,
                extra: { select: { first_name: true, last_name: true } }
              }
            }
          }
        });

        if (!engagement) {
          return {
            ok: false,
            status: 404,
            message: "Cet extra n'est pas lié à cette mission"
          };
        }

        // Mission annulée ou terminée : plus de retrait. Une mission déjà
        // commencée l'autorise encore (désistement le jour même)
        const missionBlocker = getMissionRemovalBlocker(mission.status);
        if (missionBlocker) {
          return { ok: false, status: 409, message: missionBlocker.message };
        }

        if (!canCompanyRemoveEngagement(engagement.status)) {
          return {
            ok: false,
            status: 409,
            message:
              "Seul un extra faisant partie de l'équipe (participation acceptée) peut être retiré de la mission"
          };
        }

        const updated = await tx.userMission.update({
          where: { id: engagement.id },
          data: { status: UserMissionStatus.cancelled },
          select: { id: true, status: true }
        });

        return {
          ok: true,
          result: updated,
          email: {
            to: engagement.user.email,
            props: {
              kind: "engagement",
              companyName: mission.creator.company_name,
              missionName: mission.name,
              missionLocation:
                mission.missionLocation?.fullName || "Aucun lieu spécifié",
              missionJob: convertToFrontendMissionJob(
                engagement.missionJob as PrismaMissionJob
              ),
              missionDate: formatMissionDate(engagement.missionStartDate),
              duration: formatDuration(
                engagement.missionEndDate.getTime() -
                  engagement.missionStartDate.getTime()
              ),
              message: parsed.message,
              firstName: engagement.user.extra?.first_name,
              lastName: engagement.user.extra?.last_name
            }
          }
        };
      }
    );

    if (!outcome.ok) {
      return NextResponse.json(
        { message: outcome.message },
        { status: outcome.status }
      );
    }

    // Après commit et non bloquant : le retrait enregistré fait foi, un échec
    // d'envoi ne doit pas pousser l'employeur à rejouer l'action
    try {
      const cancelUserMissionEmail = CancelUserMision(outcome.email.props);
      // Resend ne lève pas sur une erreur API : il la renvoie dans `error`
      const { error: sendError } = await resend.emails.send({
        from: "Cet Extra <no-reply@cetextra.fr>",
        to: [outcome.email.to],
        subject: "Annulation d'une mission",
        react: cancelUserMissionEmail,
        text: await render(cancelUserMissionEmail),
        headers: {
          "List-Unsubscribe": "<https://cetextra.fr/blog/unsubscribe>"
        }
      });
      if (sendError) {
        console.error("Remove user email error:", sendError);
      }
    } catch (emailError) {
      console.error("Remove user email error:", emailError);
    }

    return NextResponse.json(outcome.result, { status: 200 });
  } catch (error) {
    const { message, status } = handlePrismaError(
      error,
      "RemoveUserFromMission"
    );
    console.error("Error removing user from mission:", message);

    return NextResponse.json(
      {
        message:
          status === 503
            ? "Service momentanément indisponible, réessayez plus tard"
            : "Impossible de retirer l'extra de la mission"
      },
      { status: status === 503 ? 503 : 500 }
    );
  }
}
