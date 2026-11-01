import { auth } from "@clerk/nextjs/server";
import { UserMissionStatus } from "@prisma/client";
import { render } from "@react-email/components";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/app/lib/prisma";
import ApplicationDecision, {
  type ApplicationDecisionProps
} from "@/components/MailTemplate/ApplicationDecision";
import { EnumRole, type PrismaMissionJob } from "@/store/types";
import {
  getDecisionBlocker,
  REFUSAL_REASON_MAX_LENGTH,
  validateAgreedHourlyRate
} from "@/utils/engagement.util";
import { convertToFrontendMissionJob } from "@/utils/enum";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const resend = new Resend(process.env.RESEND_API_KEY);

type ParsedBody =
  | { decision: "accept"; hourlyRate: unknown }
  | { decision: "refuse"; reason: string | undefined };

const parseBody = (body: unknown): ParsedBody | string => {
  if (typeof body !== "object" || body === null) return "Invalid body";
  const { decision, hourlyRate, reason } = body as Record<string, unknown>;

  if (decision === "accept") return { decision, hourlyRate };

  if (decision === "refuse") {
    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      return "reason must be a string";
    }
    const trimmed = typeof reason === "string" ? reason.trim() : "";
    if (trimmed.length > REFUSAL_REASON_MAX_LENGTH) {
      return `reason must be at most ${REFUSAL_REASON_MAX_LENGTH} characters`;
    }
    return { decision, reason: trimmed || undefined };
  }

  return 'decision must be "accept" or "refuse"';
};

type DecisionOutcome =
  | { ok: false; status: number; message: string }
  | {
      ok: true;
      result: {
        id: string;
        status: UserMissionStatus;
        hourlyRate: number | null;
      };
      email: { to: string; props: ApplicationDecisionProps };
    };

/**
 * Handles PATCH requests for the mission creator deciding on an application
 * (UserMission `requested` → `accepted` | `refused`).
 *
 * - Restricted to the `company` role (401) and to the mission creator (403).
 * - Body: `{ decision: "accept", hourlyRate }` | `{ decision: "refuse", reason? }`.
 *   The agreed rate must be > 0 and ≥ the announced hourlyRateMin, if any
 *   (no ceiling). The refusal reason is only forwarded by email, never stored.
 * - Decision rules (utils/engagement.util.ts): 409 when the application is no
 *   longer `requested`, the mission is cancelled/completed, or — for an
 *   acceptance only — the mission has started or the position is full.
 *   `isPublic` is deliberately not checked (ADR 0002).
 * - Concurrency: the application row is locked first (concurrent decisions on
 *   the same application serialize), then for an acceptance the
 *   RequiredPosition row (concurrent acceptances on the last spot serialize);
 *   the accepted count is read after the locks.
 * - The extra is notified by email AFTER commit; an email failure only logs.
 *
 * @returns 200 with `{ id, status, hourlyRate }`, or 400/401/403/404/409.
 */
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ missionId: string; applicationId: string }> }
) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { missionId, applicationId } = await props.params;

    const parsed = parseBody(await req.json().catch(() => null));
    if (typeof parsed === "string") {
      return NextResponse.json({ message: parsed }, { status: 400 });
    }

    const outcome = await prisma.$transaction(
      async (tx): Promise<DecisionOutcome> => {
        // Verrou de la candidature : deux décisions simultanées sur la même
        // candidature (double clic, deux onglets) s'exécutent l'une après l'autre
        await tx.$queryRaw`
          SELECT id FROM "UserMission"
          WHERE id = ${applicationId} AND "missionId" = ${missionId}
          FOR UPDATE`;

        const application = await tx.userMission.findFirst({
          where: { id: applicationId, missionId },
          select: {
            id: true,
            status: true,
            missionJob: true,
            user: {
              select: {
                email: true,
                extra: { select: { first_name: true } }
              }
            },
            mission: {
              select: {
                name: true,
                status: true,
                missionStartDate: true,
                missionEndDate: true,
                hourlyRateMin: true,
                missionLocation: { select: { fullName: true } },
                creator: {
                  select: {
                    company_name: true,
                    user: { select: { clerkId: true } }
                  }
                }
              }
            }
          }
        });

        if (!application) {
          return { ok: false, status: 404, message: "Application not found" };
        }

        const { mission } = application;
        if (mission.creator.user.clerkId !== clerkId) {
          return { ok: false, status: 403, message: "Forbidden" };
        }

        let positionQuantity = 0;
        let acceptedCount = 0;

        if (parsed.decision === "accept") {
          const rateError = validateAgreedHourlyRate(
            parsed.hourlyRate,
            mission.hourlyRateMin
          );
          if (rateError) {
            return { ok: false, status: 400, message: rateError };
          }

          // Verrou du poste : deux acceptations simultanées sur la dernière
          // place s'exécutent l'une après l'autre, la seconde voit la première
          const positions = await tx.$queryRaw<{ quantity: number }[]>`
            SELECT quantity FROM "RequiredPosition"
            WHERE "missionId" = ${missionId}
              AND "jobType" = ${application.missionJob}::"MissionJob"
            FOR UPDATE`;
          positionQuantity = positions[0]?.quantity ?? 0;

          acceptedCount = await tx.userMission.count({
            where: {
              missionId,
              missionJob: application.missionJob,
              status: UserMissionStatus.accepted
            }
          });
        }

        const blocker = getDecisionBlocker({
          decision: parsed.decision,
          engagementStatus: application.status,
          awaitingStatus: UserMissionStatus.requested,
          missionStatus: mission.status,
          missionStartDate: mission.missionStartDate,
          positionQuantity,
          acceptedCount,
          now: new Date()
        });
        if (blocker) {
          return { ok: false, status: 409, message: blocker.message };
        }

        const hourlyRate =
          parsed.decision === "accept" ? (parsed.hourlyRate as number) : null;

        const updated = await tx.userMission.update({
          where: { id: application.id },
          data:
            parsed.decision === "accept"
              ? { status: UserMissionStatus.accepted, hourlyRate }
              : { status: UserMissionStatus.refused },
          select: { id: true, status: true, hourlyRate: true }
        });

        const baseEmailProps = {
          extraFirstName: application.user.extra?.first_name ?? "",
          companyName: mission.creator.company_name,
          missionName: mission.name,
          missionJob: convertToFrontendMissionJob(
            application.missionJob as PrismaMissionJob
          ),
          missionStartDate: mission.missionStartDate.toISOString(),
          missionEndDate: mission.missionEndDate.toISOString(),
          missionLocation:
            mission.missionLocation?.fullName ?? "Lieu non précisé"
        };

        return {
          ok: true,
          result: updated,
          email: {
            to: application.user.email,
            props:
              parsed.decision === "accept"
                ? {
                    ...baseEmailProps,
                    decision: "accept",
                    hourlyRate: hourlyRate as number
                  }
                : {
                    ...baseEmailProps,
                    decision: "refuse",
                    reason: parsed.reason
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

    // Après commit et non bloquant : la décision enregistrée fait foi, un
    // échec d'envoi ne doit pas pousser l'employeur à rejouer l'action
    try {
      const email = ApplicationDecision(outcome.email.props);
      await resend.emails.send({
        from: "Cet Extra <no-reply@cetextra.fr>",
        to: [outcome.email.to],
        subject:
          outcome.email.props.decision === "accept"
            ? `Candidature acceptée — ${outcome.email.props.missionName}`
            : `Réponse à votre candidature — ${outcome.email.props.missionName}`,
        react: email,
        text: await render(email)
      });
    } catch (emailError) {
      console.error("Application decision email error:", emailError);
    }

    return NextResponse.json(outcome.result, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error, "DecideOnApplication");
    console.error("Error deciding on application:", message);

    return NextResponse.json(
      { message: "Failed to record the decision" },
      { status: 500 }
    );
  }
}
