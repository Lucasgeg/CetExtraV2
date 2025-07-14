"use server";
import prisma from "@/app/lib/prisma";
import { CreateMissionFormValues } from "@/types/api";
import { auth } from "@clerk/nextjs/server";
import { MissionJob } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

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
        mission_end_date: new Date(missionEndDate),
        mission_start_date: new Date(missionStartDate),
        description: missionDescription,
        missionLocationId: missionLocation.id,
        additionalInfo,
        creatorId: creator.company.id,
        requiredPositions: {
          create: Object.entries(teamCounts)
            .filter(([, quantity]) => !!quantity && quantity > 0)
            .map(([jobType, quantity]) => ({
              jobType:
                MissionJob[jobType.toLowerCase() as keyof typeof MissionJob],
              quantity
            }))
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
