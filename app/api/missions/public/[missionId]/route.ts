import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  getOpenPositions,
  publicMissionSelect,
  publicMissionVisibilityWhere
} from "@/utils/missionVisibility.util";
import { handlePrismaError } from "@/utils/prismaErrors.util";

/**
 * Handles GET requests for the public detail of a mission (unauthenticated).
 *
 * Applies the full public visibility predicate (see docs/adr/0002): any
 * mission that is unknown, opted out, cancelled, already started or fully
 * staffed returns the same opaque 404 — never reveal that a hidden mission
 * exists. Feeds the public detail page and its JSON-LD JobPosting
 * (createdAt is exposed as the future datePosted source).
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

    const mission = await prisma.mission.findFirst({
      where: { id: missionId, ...publicMissionVisibilityWhere() },
      select: publicMissionSelect
    });

    if (!mission) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    const openPositions = getOpenPositions(
      mission.requiredPositions,
      mission.employees
    );

    if (openPositions.length === 0) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    const {
      employees: _employees,
      requiredPositions: _required,
      ...rest
    } = mission;

    return NextResponse.json(
      { ...rest, requiredPositions: openPositions },
      { status: 200 }
    );
  } catch (error) {
    const { message } = handlePrismaError(error, "GetPublicMissionDetail");
    console.error("Error fetching public mission detail:", message);

    return NextResponse.json(
      { message: "Failed to fetch public mission detail" },
      { status: 500 }
    );
  }
}
