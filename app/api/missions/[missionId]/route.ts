import prisma from "@/app/lib/prisma";
import { EnumRole } from "@/store/types";
import { MissionDetailApiResponse } from "@/types/MissionDetailApiResponse";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles GET requests for fetching detailed information about a specific mission.
 *
 * This endpoint is restricted to users with the `COMPANY` role. It retrieves the mission details,
 * including location, required positions, and accepted employees, from the database using Prisma.
 * The response is formatted as a `MissionDetailApiResponse` object.
 *
 * @param req - The incoming Next.js request object.
 * @param props - An object containing route parameters, specifically the `missionId`.
 * @returns {Promise<NextResponse<MissionDetailApiResponse | { message: string }>>} A NextResponse containing either the mission details (MissionDetailApiResponse)
 *          or an error message with the appropriate HTTP status code.
 *
 * @throws 401 Unauthorized - If the user is not authenticated or does not have the COMPANY role.
 * @throws 400 Bad Request - If the `missionId` parameter is missing or invalid.
 * @throws 404 Not Found - If the mission with the specified ID does not exist.
 *
 * @example
 * {{baseUrl}}/api/missions/{missionId}
 *

 **/
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<MissionDetailApiResponse | { message: string }>> {
  try {
    const { sessionClaims, userId } = await auth();
    const { missionId } = await props.params;

    if (sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
          where: {
            status: {
              in: ["accepted"]
            }
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                extra: {
                  select: {
                    first_name: true,
                    last_name: true
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

    const response: MissionDetailApiResponse = {
      id: mission.id,
      name: mission.name,
      description: mission.description,
      additionalInfo: mission.additionalInfo,
      missionStartDate: mission.missionStartDate.toISOString(),
      missionEndDate: mission.missionEndDate.toISOString(),
      creatorId: mission.creatorId,
      missionLocationId: mission.missionLocationId,
      status: mission.status,
      missionLocation: mission.missionLocation
        ? {
            id: mission.missionLocation.id,
            lat: mission.missionLocation.lat,
            lon: mission.missionLocation.lon,
            fullName: mission.missionLocation.fullName
          }
        : null,
      requiredPositions: mission.requiredPositions.map((position) => ({
        id: position.id,
        jobType: position.jobType,
        quantity: position.quantity
      })),
      employees: mission.employees.map((employee) => ({
        id: employee.id,
        missionJob: employee.missionJob,
        status: employee.status,
        startDate: employee.missionStartDate.toISOString(),
        duration:
          (employee.missionEndDate.getTime() -
            employee.missionStartDate.getTime()) /
          (1000 * 60 * 60), // Convert milliseconds to hours
        hourlyRate: employee.hourlyRate,
        user: {
          id: employee.user.id,
          email: employee.user.email,
          extra: {
            firstName: employee.user.extra?.first_name || "",
            lastName: employee.user.extra?.last_name || ""
          }
        }
      }))
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching mission:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
