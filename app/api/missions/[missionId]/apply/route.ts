import { auth } from "@clerk/nextjs/server";
import { MissionJob, Prisma, UserMissionStatus } from "@prisma/client";
import { render } from "@react-email/components";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import prisma from "@/app/lib/prisma";
import MissionApplication from "@/components/MailTemplate/MissionApplication";
import { EnumRole } from "@/store/types";
import { getMissionJobValue } from "@/utils/enum";
import {
  getOpenPositions,
  publicMissionVisibilityWhere
} from "@/utils/missionVisibility.util";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handles POST requests for an extra applying to a publicly visible mission.
 *
 * - Restricted to authenticated users with the `extra` role.
 * - The mission must satisfy the full public visibility predicate
 *   (docs/adr/0002); otherwise the same opaque 404 as the public detail.
 * - Body: `{ missionJob }` (Prisma enum value) — must match a position that
 *   still has open spots (400 otherwise). The job does not need to be
 *   declared in the extra's profile.
 * - One engagement per [user, mission]: any existing UserMission (whatever
 *   its status) returns 409 with that status; no reactivation.
 * - Creates the UserMission with status `requested` and hourlyRate null
 *   (rate is agreed later, required at the transition to accepted).
 * - Employer notification email is sent AFTER the write and is non-blocking:
 *   the application is the source of truth, an email failure only logs.
 *
 * @param req - The Next.js API request object.
 * @param props - Route parameters containing `missionId`.
 * @returns 201 with `{ id, status }`, or 400/401/404/409 as described.
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ missionId: string }> }
) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.EXTRA) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { missionId } = await props.params;

    const body = await req.json().catch(() => null);
    const missionJob = body?.missionJob as MissionJob | undefined;
    if (!missionJob || !Object.values(MissionJob).includes(missionJob)) {
      return NextResponse.json(
        { message: "Invalid missionJob parameter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        extra: { select: { first_name: true, last_name: true } }
      }
    });
    if (!user?.extra) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const mission = await prisma.mission.findFirst({
      where: { id: missionId, ...publicMissionVisibilityWhere() },
      select: {
        id: true,
        name: true,
        missionStartDate: true,
        missionEndDate: true,
        missionLocation: { select: { fullName: true } },
        creator: { select: { user: { select: { email: true } } } },
        requiredPositions: { select: { jobType: true, quantity: true } },
        employees: {
          where: { status: UserMissionStatus.accepted },
          select: { missionJob: true }
        }
      }
    });

    const openPositions = mission
      ? getOpenPositions(mission.requiredPositions, mission.employees)
      : [];

    // Même 404 opaque que le détail public : ne jamais révéler qu'une
    // mission cachée ou complète existe
    if (!mission || openPositions.length === 0) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    if (!openPositions.some((position) => position.jobType === missionJob)) {
      return NextResponse.json(
        { message: "This position is not open on this mission" },
        { status: 400 }
      );
    }

    const existing = await prisma.userMission.findUnique({
      where: { userId_missionId: { userId: user.id, missionId } },
      select: { status: true }
    });
    if (existing) {
      return NextResponse.json(
        {
          message: "Already engaged with this mission",
          status: existing.status
        },
        { status: 409 }
      );
    }

    let application: { id: string; status: UserMissionStatus };
    try {
      application = await prisma.userMission.create({
        data: {
          userId: user.id,
          missionId,
          missionStartDate: mission.missionStartDate,
          missionEndDate: mission.missionEndDate,
          missionJob,
          hourlyRate: null,
          status: UserMissionStatus.requested
        },
        select: { id: true, status: true }
      });
    } catch (createError) {
      // Course entre le check et le create : l'unicité [userId, missionId]
      // reste la garantie finale
      if (
        createError instanceof Prisma.PrismaClientKnownRequestError &&
        createError.code === "P2002"
      ) {
        return NextResponse.json(
          { message: "Already engaged with this mission" },
          { status: 409 }
        );
      }
      throw createError;
    }

    try {
      const applicationEmail = MissionApplication({
        extraName: `${user.extra.first_name} ${user.extra.last_name}`,
        missionName: mission.name,
        missionJob: getMissionJobValue(missionJob),
        missionDate: mission.missionStartDate.toISOString(),
        missionLocation:
          mission.missionLocation?.fullName ?? "Lieu non précisé",
        ctaUrl: `https://cetextra.fr/company/missions/${mission.id}`
      });

      await resend.emails.send({
        from: "Cet Extra <no-reply@cetextra.fr>",
        to: [mission.creator.user.email],
        subject: `Nouvelle candidature — ${mission.name}`,
        react: applicationEmail,
        text: await render(applicationEmail)
      });
    } catch (emailError) {
      console.error("Application notification email error:", emailError);
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    const { message } = handlePrismaError(error, "ApplyToMission");
    console.error("Error applying to mission:", message);

    return NextResponse.json(
      { message: "Failed to apply to mission" },
      { status: 500 }
    );
  }
}
