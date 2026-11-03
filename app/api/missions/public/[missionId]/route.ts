import { NextResponse } from "next/server";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { getPublicMission } from "@/utils/publicMissions.server";

/**
 * Handles GET requests for the public detail of a mission (unauthenticated).
 *
 * Applies the full public visibility predicate (see docs/adr/0002) via
 * `getPublicMission` (shared with the `/missions/[missionId]` page): any
 * mission that is unknown, opted out, cancelled, already started or fully
 * staffed returns the same opaque 404 — never reveal that a hidden mission
 * exists. createdAt is exposed as the JSON-LD JobPosting datePosted source.
 *
 * @param _req - The Next.js API request object (unused).
 * @param props - Route parameters containing `missionId`.
 * @returns A JSON response with the public-safe mission detail, or 404.
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ missionId: string }> }
) {
  try {
    const { missionId } = await props.params;

    const mission = await getPublicMission(missionId);

    if (!mission) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mission, { status: 200 });
  } catch (error) {
    const { message } = handlePrismaError(error, "GetPublicMissionDetail");
    console.error("Error fetching public mission detail:", message);

    return NextResponse.json(
      { message: "Failed to fetch public mission detail" },
      { status: 500 }
    );
  }
}
