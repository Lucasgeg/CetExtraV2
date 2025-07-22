"use server";
import prisma from "@/app/lib/prisma";
import { EnumMissionJob } from "@/store/types";
import { CreateMissionFormValues } from "@/types/api";
import { convertToDbMissionJob } from "@/utils/enum";
import { auth } from "@clerk/nextjs/server";
import { MissionJob } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the creation of a new mission.
 *
 * This POST endpoint expects a JSON body matching the `CreateMissionFormValues` type,
 * validates the user's authentication and role, checks required fields, and creates
 * a new mission in the database. It also ensures the mission location exists or creates it,
 * associates the mission with the creator's company, and sets up required team positions.
 *
 * Authorization:
 * - Only users with the "company" role (as determined by Clerk session claims) are allowed.
 *
 * Request Body:
 * - `location`: Object containing latitude, longitude, and display name.
 * - `missionDescription`: (optional) Description of the mission.
 * - `missionEndDate`: End date of the mission (string or date).
 * - `missionName`: Name of the mission.
 * - `missionStartDate`: Start date of the mission (string or date).
 * - `teamCounts`: Object mapping job types to required quantities.
 * - `additionalInfo`: (optional) Additional information about the mission.
 *
 * Responses:
 * - 201: Mission created successfully. Returns the created mission object.
 * - 400: Missing required fields.
 * - 401: Unauthorized (missing or invalid session/role).
 * - 404: Creator (company) not found.
 * - 500: Error creating mission (with error message).
 *
 * @param req - The Next.js request object containing the mission data.
 * @returns A Next.js Response or NextResponse with the result of the operation.
 */
export async function POST(req: NextRequest) {
  const { sessionClaims, userId } = await auth();

  if (
    !sessionClaims ||
    !userId ||
    sessionClaims.publicMetadata.role !== "company"
  ) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const {
    location,
    missionDescription,
    missionEndDate,
    missionName,
    missionStartDate,
    teamCounts,
    additionalInfo
  } = (await req.json()) as CreateMissionFormValues;

  if (!missionName || !missionStartDate || !missionEndDate || !location) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const creator = await prisma.user.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      company: {
        select: {
          id: true
        }
      }
    }
  });

  if (!creator?.company?.id) {
    return new Response(JSON.stringify({ message: "Creator not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const missionLocation = await prisma.missionLocation.upsert({
      where: {
        lat_lon: {
          lat: location.lat,
          lon: location.lon
        }
      },
      update: {},
      create: {
        fullName: location.display_name,
        lat: location.lat,
        lon: location.lon
      }
    });

    const mission = await prisma.mission.create({
      data: {
        name: missionName,
        missionEndDate: new Date(missionEndDate),
        missionStartDate: new Date(missionStartDate),
        description: missionDescription,
        missionLocationId: missionLocation.id,
        additionalInfo,
        creatorId: creator.company.id,
        requiredPositions: {
          create: Object.entries(teamCounts)
            .filter(([, quantity]) => !!quantity && quantity > 0)
            .map(([jobType, quantity]) => {
              // Conversion sécurisée du job type frontend vers le format BD
              const frontendJobType = jobType as EnumMissionJob;
              return {
                jobType: convertToDbMissionJob(
                  frontendJobType
                ) as unknown as MissionJob,
                quantity
              };
            })
        }
      }
    });

    return NextResponse.json(
      {
        message: "Mission created successfully",
        mission
      },
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error creating mission",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}
