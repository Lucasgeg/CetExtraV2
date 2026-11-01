import { auth } from "@clerk/nextjs/server";
import { type MissionJob, UserMissionStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { EnumRole } from "@/store/types";
import type {
  GetMissionApplicationsResponse,
  MissionApplication,
  MissionApplicationsPosition
} from "@/types/MissionApplications";
import { calculateDistance } from "@/utils/distance.utils";
import { getDecisionBlocker } from "@/utils/engagement.util";
import { handlePrismaError } from "@/utils/prismaErrors.util";

const parseCoordinate = (value: string | null | undefined): number | null => {
  if (value === null || value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Handles GET requests listing the pending applications (UserMission
 * `requested`) of a mission, for its creator company.
 *
 * - Restricted to the `company` role (401) and to the mission creator (403).
 * - Applications are grouped by position with the accepted count and, per
 *   position, whether an application could currently be accepted
 *   (`acceptBlocker`, same rules as the decision endpoint).
 * - Candidates are exposed without contact data nor exact location: only the
 *   home ↔ mission distance, rounded to the km.
 *
 * @returns 200 with GetMissionApplicationsResponse, or 401/403/404.
 */
export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<GetMissionApplicationsResponse | { message: string }>> {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { missionId } = await props.params;

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        status: true,
        missionStartDate: true,
        hourlyRateMin: true,
        hourlyRateMax: true,
        creator: { select: { user: { select: { clerkId: true } } } },
        missionLocation: { select: { lat: true, lon: true } },
        requiredPositions: { select: { jobType: true, quantity: true } },
        employees: {
          where: {
            status: {
              in: [UserMissionStatus.requested, UserMissionStatus.accepted]
            }
          },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            missionJob: true,
            createdAt: true,
            user: {
              select: {
                profilePictureUrl: true,
                description: true,
                userLocation: { select: { lat: true, lon: true } },
                extra: {
                  select: {
                    first_name: true,
                    last_name: true,
                    missionJobs: {
                      select: { missionJob: true, experience: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mission) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    if (mission.creator.user.clerkId !== clerkId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const positions = new Map<MissionJob, MissionApplicationsPosition>();
    const getPosition = (jobType: MissionJob, quantity = 0) => {
      let position = positions.get(jobType);
      if (!position) {
        position = {
          jobType,
          quantity,
          acceptedCount: 0,
          acceptBlocker: null,
          applications: []
        };
        positions.set(jobType, position);
      }
      return position;
    };

    for (const { jobType, quantity } of mission.requiredPositions) {
      getPosition(jobType, quantity);
    }

    for (const employee of mission.employees) {
      // Candidature sur un poste retiré de la mission depuis : on la garde
      // visible (quantité 0 → non acceptable) pour que l'employeur puisse la refuser
      const position = getPosition(employee.missionJob);

      if (employee.status === UserMissionStatus.accepted) {
        position.acceptedCount++;
        continue;
      }

      const extra = employee.user.extra;
      if (!extra) continue;

      const userLat = parseCoordinate(employee.user.userLocation?.lat);
      const userLon = parseCoordinate(employee.user.userLocation?.lon);
      const distanceKm =
        mission.missionLocation && userLat !== null && userLon !== null
          ? Math.round(
              calculateDistance(
                mission.missionLocation.lat,
                mission.missionLocation.lon,
                userLat,
                userLon
              )
            )
          : null;

      const application: MissionApplication = {
        id: employee.id,
        createdAt: employee.createdAt.toISOString(),
        extra: {
          firstName: extra.first_name,
          lastName: extra.last_name,
          profilePictureUrl: employee.user.profilePictureUrl,
          description: employee.user.description,
          experience:
            extra.missionJobs.find(
              (job) => job.missionJob === employee.missionJob
            )?.experience ?? null,
          distanceKm
        }
      };
      position.applications.push(application);
    }

    const result = [...positions.values()]
      // Les postes sans candidature n'ont rien à afficher dans cette vue
      .filter((position) => position.applications.length > 0)
      .map((position) => ({
        ...position,
        acceptBlocker:
          getDecisionBlocker({
            decision: "accept",
            engagementStatus: UserMissionStatus.requested,
            awaitingStatus: UserMissionStatus.requested,
            missionStatus: mission.status,
            missionStartDate: mission.missionStartDate,
            positionQuantity: position.quantity,
            acceptedCount: position.acceptedCount,
            now
          })?.code ?? null
      }));

    return NextResponse.json({
      hourlyRateMin: mission.hourlyRateMin,
      hourlyRateMax: mission.hourlyRateMax,
      total: result.reduce(
        (sum, position) => sum + position.applications.length,
        0
      ),
      positions: result
    });
  } catch (error) {
    const { message } = handlePrismaError(error, "GetMissionApplications");
    console.error("Error fetching mission applications:", message);

    return NextResponse.json(
      { message: "Failed to fetch mission applications" },
      { status: 500 }
    );
  }
}
