import type { MissionJob } from "@prisma/client";
import { MissionStatus, UserMissionStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { calculateDistance } from "@/utils/distance.utils";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const DEFAULT_RADIUS_KM = 50;
const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 200;
const DEFAULT_TAKE = 10;
const MAX_TAKE = 50;

/**
 * Handles GET requests for the public mission listing (unauthenticated).
 *
 * Visibility predicate (see docs/adr/0002 + CONTEXT.md "Mission visible"):
 * isPublic, status pending, location set, not started yet, at least one
 * position not fully staffed (accepted engagements only).
 *
 * Two parts of the predicate are not expressible in a Prisma `where`
 * (per-group aggregate for staffed positions, Haversine distance), so they
 * are filtered in memory BEFORE pagination — never paginate in SQL then
 * filter in memory (wrong page sizes and totals). Loading every live public
 * mission per request is deliberate at MVP volume; revisit with raw SQL if
 * it grows.
 *
 * Query params:
 * - `lat`/`lon`: optional, both or none (400 otherwise) — zone filter center.
 * - `radius`: km, only with lat/lon; default 50, clamped to [1, 200].
 * - `take`/`skip`: pagination; take defaults to 10, clamped to [1, 50].
 *
 * Sorting: distance ascending when lat/lon provided, otherwise
 * missionStartDate ascending.
 *
 * @param req - The Next.js API request object.
 * @returns A JSON response with public-safe missions, total count and pagination metadata.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // 1. Paramètres de zone : lat/lon vont ensemble
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    if ((latParam === null) !== (lonParam === null)) {
      return NextResponse.json(
        { message: "lat and lon must be provided together" },
        { status: 400 }
      );
    }

    let center: { lat: number; lon: number } | null = null;
    if (latParam !== null && lonParam !== null) {
      const lat = Number.parseFloat(latParam);
      const lon = Number.parseFloat(lonParam);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon) ||
        Math.abs(lat) > 90 ||
        Math.abs(lon) > 180
      ) {
        return NextResponse.json(
          { message: "Invalid lat/lon parameters" },
          { status: 400 }
        );
      }
      center = { lat, lon };
    }

    let radius = DEFAULT_RADIUS_KM;
    const radiusParam = searchParams.get("radius");
    if (radiusParam !== null) {
      const parsedRadius = Number.parseFloat(radiusParam);
      if (!Number.isFinite(parsedRadius)) {
        return NextResponse.json(
          { message: "Invalid radius parameter" },
          { status: 400 }
        );
      }
      radius = Math.min(Math.max(parsedRadius, MIN_RADIUS_KM), MAX_RADIUS_KM);
    }

    // 2. Pagination (inputs publics : bornés)
    const takeParam = Number.parseInt(searchParams.get("take") ?? "", 10);
    const take = Number.isFinite(takeParam)
      ? Math.min(Math.max(takeParam, 1), MAX_TAKE)
      : DEFAULT_TAKE;

    const skipParam = Number.parseInt(searchParams.get("skip") ?? "", 10);
    const skip = Number.isFinite(skipParam) ? Math.max(skipParam, 0) : 0;

    // 3. Partie SQL-exprimable du prédicat de visibilité
    const missions = await prisma.mission.findMany({
      where: {
        isPublic: true,
        status: MissionStatus.pending,
        missionLocationId: { not: null },
        missionStartDate: { gt: new Date() }
      },
      select: {
        id: true,
        name: true,
        description: true,
        missionStartDate: true,
        missionEndDate: true,
        hourlyRateMin: true,
        hourlyRateMax: true,
        missionLocation: {
          select: { fullName: true, lat: true, lon: true }
        },
        creator: {
          select: { company_name: true, businessSector: true, logoId: true }
        },
        requiredPositions: {
          select: { jobType: true, quantity: true }
        },
        employees: {
          where: { status: UserMissionStatus.accepted },
          select: { missionJob: true }
        }
      },
      orderBy: { missionStartDate: "asc" }
    });

    // 4. Reste du prédicat : postes non pourvus + distance
    const visibleMissions = missions.flatMap((mission) => {
      const { employees, requiredPositions, missionLocation, ...rest } =
        mission;

      // Garanti non null par le where, mais le type Prisma reste nullable
      if (!missionLocation) {
        return [];
      }

      const acceptedByJob = new Map<MissionJob, number>();
      for (const { missionJob } of employees) {
        acceptedByJob.set(missionJob, (acceptedByJob.get(missionJob) ?? 0) + 1);
      }

      const openPositions = requiredPositions
        .map(({ jobType, quantity }) => ({
          jobType,
          remaining: quantity - (acceptedByJob.get(jobType) ?? 0)
        }))
        .filter(({ remaining }) => remaining > 0);

      if (openPositions.length === 0) {
        return [];
      }

      const distance = center
        ? calculateDistance(
            center.lat,
            center.lon,
            missionLocation.lat,
            missionLocation.lon
          )
        : null;

      if (distance !== null && distance > radius) {
        return [];
      }

      return [
        {
          ...rest,
          missionLocation,
          requiredPositions: openPositions,
          distance: distance === null ? null : Math.round(distance * 10) / 10
        }
      ];
    });

    // 5. Tri puis pagination en mémoire (après filtrage, jamais avant)
    if (center) {
      visibleMissions.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    const total = visibleMissions.length;
    const pageMissions = visibleMissions.slice(skip, skip + take);

    return NextResponse.json(
      {
        missions: pageMissions,
        total,
        metadata: {
          total,
          page: Math.floor(skip / take) + 1,
          pageSize: take,
          totalPages: Math.ceil(total / take),
          hasMore: skip + take < total
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const { message } = handlePrismaError(error, "GetPublicMissions");
    console.error("Error fetching public missions:", message);

    return NextResponse.json(
      { message: "Failed to fetch public missions" },
      { status: 500 }
    );
  }
}
