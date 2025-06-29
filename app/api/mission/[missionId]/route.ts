import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ missionId: string }> }
) {
  try {
    const { missionId } = await props.params;

    if (!missionId || typeof missionId !== "string") {
      return NextResponse.json(
        { message: "Invalid missionId parameter" },
        { status: 400 }
      );
    }

    // Fetch the mission details from the database
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        missionLocation: true,
        requiredPositions: true,
        employees: {
          include: {
            user: {
              select: {
                extra: {
                  select: {
                    last_name: true,
                    first_name: true
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

    return NextResponse.json(mission);
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
