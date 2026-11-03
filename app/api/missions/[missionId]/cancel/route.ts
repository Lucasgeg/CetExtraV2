import { auth } from "@clerk/nextjs/server";
import { MissionStatus, Prisma, UserMissionStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/app/lib/prisma";
import CancelUserMision, {
  type CancelUserMisionProps
} from "@/components/MailTemplate/CancelUserMission";
import { EnumRole, type PrismaMissionJob } from "@/store/types";
import type {
  MissionCancellationApiRequest,
  MissionCancellationApiResponse
} from "@/types/MissionCancellation";
import { formatDuration } from "@/utils/date";
import {
  ENGAGEMENT_STATUSES_CANCELLED_WITH_MISSION,
  ENGAGEMENT_STATUSES_NOTIFIED_ON_MISSION_CANCELLATION,
  INVITATION_STATUSES_CANCELLED_WITH_MISSION,
  isMissionCancellable,
  MISSION_CANCELLATION_MESSAGE_MAX_LENGTH
} from "@/utils/engagement.util";
import { convertToFrontendMissionJob } from "@/utils/enum";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { absoluteUrl } from "@/utils/siteUrl";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Limite d'emails par appel à l'API batch de Resend. */
const RESEND_BATCH_LIMIT = 100;

const parseBody = (body: unknown): MissionCancellationApiRequest | string => {
  if (typeof body !== "object" || body === null) return "Invalid body";
  const { message } = body as Record<string, unknown>;

  if (
    message !== undefined &&
    message !== null &&
    typeof message !== "string"
  ) {
    return "message must be a string";
  }
  const trimmed = typeof message === "string" ? message.trim() : "";
  if (trimmed.length > MISSION_CANCELLATION_MESSAGE_MAX_LENGTH) {
    return `message must be at most ${MISSION_CANCELLATION_MESSAGE_MAX_LENGTH} characters`;
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

type CancellationEmail = { to: string; props: CancelUserMisionProps };

type CancellationOutcome =
  | { ok: false; status: number; message: string }
  | {
      ok: true;
      cancelled: MissionCancellationApiResponse["cancelled"];
      emails: CancellationEmail[];
    };

/**
 * Envoie les emails par lots (API batch Resend, validation permissive : une
 * adresse invalide n'empêche pas l'envoi des autres). Ne lève jamais.
 *
 * @returns le nombre d'emails non envoyés.
 */
const sendCancellationEmails = async (
  emails: CancellationEmail[]
): Promise<number> => {
  let failures = 0;

  for (let start = 0; start < emails.length; start += RESEND_BATCH_LIMIT) {
    const chunk = emails.slice(start, start + RESEND_BATCH_LIMIT);
    try {
      // Resend ne lève pas sur une erreur API : il la renvoie dans `error`
      const { data, error } = await resend.batch.send(
        chunk.map((email) => ({
          from: "Cet Extra <no-reply@cetextra.fr>",
          to: [email.to],
          subject: "Annulation d'une mission",
          react: CancelUserMision(email.props),
          headers: {
            "List-Unsubscribe": `<${absoluteUrl("/blog/unsubscribe")}>`
          }
        })),
        { batchValidation: "permissive" }
      );

      if (error) {
        failures += chunk.length;
        console.error("Mission cancellation emails error:", { error });
      } else {
        // Validation permissive : les emails rejetés sont listés par index
        const rejected = data.errors ?? [];
        if (rejected.length > 0) {
          failures += rejected.length;
          console.error("Mission cancellation emails partial error:", {
            error: rejected
          });
        }
      }
    } catch (error) {
      failures += chunk.length;
      console.error("Mission cancellation emails error:", { error });
    }
  }

  return failures;
};

/**
 * Handles the PATCH request for a company cancelling one of its missions.
 *
 * - Restricted to the `company` role (401) and to the mission creator (403).
 * - Body: `{ message?: string }` (≤ MISSION_CANCELLATION_MESSAGE_MAX_LENGTH),
 *   forwarded by email only, never stored (400 if invalid).
 * - 409 when the mission is already cancelled or completed.
 * - In one transaction, with the mission row locked (concurrent cancellations
 *   serialize, the second one gets 409): the mission becomes `cancelled`, its
 *   `pending` / `requested` / `accepted` engagements become `cancelled`
 *   (`refused` and `cancelled` are kept as history), and its `pending`
 *   Invitations (extras not registered yet) become `cancelled`.
 *   Rules: utils/engagement.util.ts.
 * - AFTER commit, the `accepted` and `requested` extras are emailed, each with
 *   the dates of their own engagement. `pending` invitations are cancelled
 *   silently. An email failure does not fail the request: the cancellation
 *   is committed, the response reports `emailFailures`.
 *
 * @returns 200 with MissionCancellationApiResponse, or 400/401/403/404/409.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse> {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { missionId } = await props.params;
    if (!missionId) {
      return NextResponse.json(
        { message: "Mission ID is required" },
        { status: 400 }
      );
    }

    const parsed = parseBody(await request.json().catch(() => null));
    if (typeof parsed === "string") {
      return NextResponse.json({ message: parsed }, { status: 400 });
    }

    const outcome = await prisma.$transaction(
      async (tx): Promise<CancellationOutcome> => {
        // Verrou de la mission : deux annulations simultanées (double clic,
        // deux onglets) s'exécutent l'une après l'autre, la seconde voit
        // `cancelled` et renvoie 409 sans renvoyer d'emails
        await tx.$queryRaw`
          SELECT id FROM "Mission" WHERE id = ${missionId} FOR UPDATE`;

        const mission = await tx.mission.findUnique({
          where: { id: missionId },
          select: {
            name: true,
            status: true,
            missionLocation: { select: { fullName: true } },
            creator: {
              select: {
                company_name: true,
                user: { select: { clerkId: true } }
              }
            }
          }
        });

        if (!mission) {
          return { ok: false, status: 404, message: "Mission not found" };
        }

        if (mission.creator.user.clerkId !== clerkId) {
          return { ok: false, status: 403, message: "Forbidden" };
        }

        if (!isMissionCancellable(mission.status)) {
          return {
            ok: false,
            status: 409,
            message: `Mission is ${mission.status}`
          };
        }

        // Verrou des engagements visés, lus avant la mise à jour (après, tous
        // valent `cancelled`). Une décision concurrente sur une candidature
        // (applications/[applicationId], qui verrouille la UserMission) se
        // termine avant cette lecture : on voit son statut final, ce qui évite
        // d'écrire à un extra refusé entre-temps ou de se tromper de variante.
        // Ordre Mission → UserMission ; l'autre route fait UserMission →
        // RequiredPosition sans prendre Mission : pas de cycle.
        const locked = await tx.$queryRaw<
          { id: string; status: UserMissionStatus }[]
        >`
          SELECT id, status FROM "UserMission"
          WHERE "missionId" = ${missionId}
            AND status IN (${Prisma.join(
              ENGAGEMENT_STATUSES_CANCELLED_WITH_MISSION.map(
                (status) => Prisma.sql`${status}::"UserMissionStatus"`
              )
            )})
          ORDER BY id
          FOR UPDATE`;

        const statusById = new Map(
          locked.map((engagement) => [engagement.id, engagement.status])
        );
        const notifiedIds = locked
          .filter((engagement) =>
            (
              ENGAGEMENT_STATUSES_NOTIFIED_ON_MISSION_CANCELLATION as readonly UserMissionStatus[]
            ).includes(engagement.status)
          )
          .map((engagement) => engagement.id);

        const recipients = await tx.userMission.findMany({
          where: { id: { in: notifiedIds } },
          select: {
            id: true,
            missionStartDate: true,
            missionEndDate: true,
            missionJob: true,
            user: {
              select: {
                email: true,
                extra: { select: { first_name: true, last_name: true } }
              }
            }
          }
        });

        const engagements = await tx.userMission.updateMany({
          where: {
            missionId,
            status: { in: [...ENGAGEMENT_STATUSES_CANCELLED_WITH_MISSION] }
          },
          data: { status: UserMissionStatus.cancelled }
        });

        const invitations = await tx.invitation.updateMany({
          where: {
            missionId,
            status: { in: [...INVITATION_STATUSES_CANCELLED_WITH_MISSION] }
          },
          data: { status: UserMissionStatus.cancelled }
        });

        await tx.mission.update({
          where: { id: missionId },
          data: { status: MissionStatus.cancelled }
        });

        const missionLocation =
          mission.missionLocation?.fullName || "Aucun lieu spécifié";

        return {
          ok: true,
          cancelled: {
            engagements: engagements.count,
            invitations: invitations.count
          },
          emails: recipients.map((recipient) => ({
            to: recipient.user.email,
            props: {
              // Candidat en attente : l'email parle de sa candidature, pas
              // d'une participation qui n'a jamais été confirmée
              kind:
                statusById.get(recipient.id) === UserMissionStatus.requested
                  ? "application"
                  : "engagement",
              companyName: mission.creator.company_name,
              missionName: mission.name,
              missionLocation,
              missionJob: convertToFrontendMissionJob(
                recipient.missionJob as PrismaMissionJob
              ),
              missionDate: formatMissionDate(recipient.missionStartDate),
              duration: formatDuration(
                recipient.missionEndDate.getTime() -
                  recipient.missionStartDate.getTime()
              ),
              message: parsed.message,
              firstName: recipient.user.extra?.first_name,
              lastName: recipient.user.extra?.last_name
            }
          }))
        };
      }
    );

    if (!outcome.ok) {
      return NextResponse.json(
        { message: outcome.message },
        { status: outcome.status }
      );
    }

    // Après commit : l'annulation enregistrée fait foi, un échec d'envoi est
    // signalé à l'employeur sans le pousser à rejouer l'action
    const emailFailures = await sendCancellationEmails(outcome.emails);

    const body: MissionCancellationApiResponse = {
      success: true,
      cancelled: outcome.cancelled,
      notified: outcome.emails.length,
      emailFailures
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error, "CancelMission");
    console.error("Error cancelling mission:", message);

    return NextResponse.json(
      { message: "Failed to cancel the mission" },
      { status: 500 }
    );
  }
}
