import { auth } from "@clerk/nextjs/server";
import { type Prisma, UserMissionStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { EnumRole, type PrismaMissionJob } from "@/store/types";
import {
  ENGAGEMENT_SCOPES,
  type EngagementScope,
  type MeEngagement,
  type MeEngagementsResponse
} from "@/types/MeEngagements";
import { convertToFrontendMissionJob } from "@/utils/enum";
import {
  getOpenPositions,
  publicMissionVisibilityWhere
} from "@/utils/missionVisibility.util";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const USER_MISSION_STATUSES = Object.values(UserMissionStatus);

const isUserMissionStatus = (value: string): value is UserMissionStatus =>
  (USER_MISSION_STATUSES as string[]).includes(value);

const isEngagementScope = (value: string): value is EngagementScope =>
  (ENGAGEMENT_SCOPES as readonly string[]).includes(value);

/**
 * Handles GET requests for the engagements (UserMission) of the signed-in
 * extra: received invitations (`pending`), sent applications (`requested`),
 * confirmed missions (`accepted`), `refused` and `cancelled`.
 *
 * - Restricted to authenticated users with the `extra` role (401 otherwise).
 *   The user is always resolved from the Clerk session, never from a param.
 * - Query params (optional):
 *   - `status`: one or more `UserMissionStatus` (`?status=a&status=b` or
 *     `?status=a,b`); any unknown value returns 400.
 *   - `scope`: `upcoming` | `past` | `all` (default), on the engagement end
 *     date; any other value returns 400.
 * - Sorted by engagement start date ascending.
 * - Visibility: `hourlyRate` only for `accepted`. Location: full address for
 *   `accepted` and `pending` (an invitation comes from the employer, who
 *   addresses this extra directly: the extra needs the place to decide, even
 *   on a private mission); for any other status, only what the public
 *   mission detail already exposes, i.e. the address only while the mission
 *   satisfies the full public visibility predicate (docs/adr/0002), null
 *   otherwise. No company contact data.
 *
 * @param req - The Next.js API request object.
 * @returns 200 with `{ engagements }`, or 400/401/404/500.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.EXTRA) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    // 1. Filtres optionnels, validés (400 sur toute valeur inconnue)
    const rawStatuses = searchParams
      .getAll("status")
      .flatMap((value) => value.split(","))
      .map((value) => value.trim());
    if (!rawStatuses.every(isUserMissionStatus)) {
      return NextResponse.json(
        { message: "Invalid status parameter" },
        { status: 400 }
      );
    }
    const statuses = [...new Set(rawStatuses)];

    const scope = searchParams.get("scope") ?? "all";
    if (!isEngagementScope(scope)) {
      return NextResponse.json(
        { message: "Invalid scope parameter" },
        { status: 400 }
      );
    }

    // 2. Utilisateur résolu par la session uniquement
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, extra: { select: { id: true } } }
    });
    if (!user?.extra) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const where: Prisma.UserMissionWhereInput = {
      userId: user.id,
      ...(statuses.length > 0 && { status: { in: statuses } }),
      ...(scope === "upcoming" && { missionEndDate: { gte: now } }),
      ...(scope === "past" && { missionEndDate: { lt: now } })
    };

    const engagements = await prisma.userMission.findMany({
      where,
      select: {
        id: true,
        status: true,
        missionJob: true,
        missionStartDate: true,
        missionEndDate: true,
        hourlyRate: true,
        mission: {
          select: {
            id: true,
            name: true,
            status: true,
            missionLocation: { select: { fullName: true } },
            creator: { select: { company_name: true } }
          }
        }
      },
      orderBy: { missionStartDate: "asc" }
    });

    // 3. Adresse complète pour `accepted` et `pending` (invitation adressée
    // par l'employeur à cet extra) ; pour les autres statuts, seulement si la
    // mission est visible publiquement (même prédicat que le détail public)
    const fullLocationStatuses: UserMissionStatus[] = [
      UserMissionStatus.accepted,
      UserMissionStatus.pending
    ];
    const publicOnlyMissionIds = engagements
      .filter(({ status }) => !fullLocationStatuses.includes(status))
      .map(({ mission }) => mission.id);

    const publicCandidates =
      publicOnlyMissionIds.length > 0
        ? await prisma.mission.findMany({
            where: {
              id: { in: publicOnlyMissionIds },
              ...publicMissionVisibilityWhere()
            },
            select: {
              id: true,
              requiredPositions: { select: { jobType: true, quantity: true } },
              employees: {
                where: { status: UserMissionStatus.accepted },
                select: { missionJob: true }
              }
            }
          })
        : [];

    const publiclyVisibleMissionIds = new Set(
      publicCandidates
        .filter(
          ({ requiredPositions, employees }) =>
            getOpenPositions(requiredPositions, employees).length > 0
        )
        .map(({ id }) => id)
    );

    // 4. Projection en liste blanche, champ par champ
    const body: MeEngagementsResponse = {
      engagements: engagements.map((engagement): MeEngagement => {
        const { mission } = engagement;
        const base = {
          id: engagement.id,
          missionJob: convertToFrontendMissionJob(
            engagement.missionJob as PrismaMissionJob
          ),
          missionStartDate: engagement.missionStartDate.toISOString(),
          missionEndDate: engagement.missionEndDate.toISOString(),
          mission: {
            id: mission.id,
            name: mission.name,
            status: mission.status,
            companyName: mission.creator.company_name
          }
        };
        const fullName = mission.missionLocation?.fullName ?? null;

        if (engagement.status === UserMissionStatus.accepted) {
          return {
            ...base,
            status: engagement.status,
            hourlyRate: engagement.hourlyRate,
            location: fullName
          };
        }

        return {
          ...base,
          status: engagement.status,
          location:
            fullLocationStatuses.includes(engagement.status) ||
            publiclyVisibleMissionIds.has(mission.id)
              ? fullName
              : null
        };
      })
    };

    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error, "GetMyEngagements");
    console.error("Error fetching extra engagements:", message);

    return NextResponse.json(
      { message: "Failed to fetch engagements" },
      { status: 500 }
    );
  }
}
