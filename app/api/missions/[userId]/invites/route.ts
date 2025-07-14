import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { UserMissionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const { userId: clerkId } = await auth();
  const { userId } = await props.params;

  if (!clerkId || clerkId !== userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const take = searchParams.get("take");

  try {
    const invites = await prisma.userMission.findMany({
      where: {
        user: {
          clerkId
        },
        status: UserMissionStatus.pending
      },
      select: {
        id: true,
        missionStartDate: true,
        missionEndDate: true,
        mission: {
          select: {
            creator: {
              select: {
                company_name: true
              }
            },
            name: true,
            id: true,
            mission_start_date: true,
            missionLocation: {
              select: {
                fullName: true
              }
            }
          }
        },
        missionJob: true,
        hourlyRate: true
      },
      take: take ? parseInt(take) : undefined,
      orderBy: {
        missionStartDate: "asc"
      }
    });

    return NextResponse.json(invites, {
      status: 200
    });
  } catch (error) {
    console.error("Error fetching user missions:", error);
    return NextResponse.json(
      { message: "Error fetching user missions" },
      { status: 500 }
    );
  }
}
