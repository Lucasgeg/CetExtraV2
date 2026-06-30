import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { EnumMissionSelector } from "@/types/api";

/**
 *
 * @param req
 * @param props
 * @returns A list of missions for a specific user
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId } = await props.params;
  const { userId: clerkId } = await auth();

  if (!userId || typeof userId !== "string") {
    return new NextResponse(
      JSON.stringify({ message: "Invalid userId parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  if (!clerkId || clerkId !== userId) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const searchParams = req.nextUrl.searchParams;
  const missionSelector: EnumMissionSelector =
    (searchParams.get("missionSelector") as EnumMissionSelector) ||
    EnumMissionSelector.INCOMING;
  const take = searchParams.get("take")
    ? parseInt(searchParams.get("take")!, 10)
    : 10;
  const skip = searchParams.get("skip")
    ? parseInt(searchParams.get("skip")!, 10)
    : 0;

  // biome-ignore lint/suspicious/noExplicitAny: Prisma where clause shape varies by query branch
  const whereCondition: any = {
    userId,
    mission: {
      status: {
        in: missionSelector === "past" ? ["completed"] : ["active", "pending"]
      }
    }
  };
  const total = await prisma.userMission.count({ where: whereCondition });
  try {
    const missions = await prisma.userMission.findMany({
      where: whereCondition,
      select: {
        id: true,
        missionStartDate: true,
        missionEndDate: true,
        mission: {
          select: {
            id: true,
            name: true,
            missionLocation: {
              select: {
                fullName: true
              }
            },
            creator: {
              select: {
                company_name: true
              }
            }
          }
        }
      },
      take,
      skip,
      orderBy: {
        missionStartDate: "asc"
      }
    });

    return NextResponse.json(
      {
        missions,
        metadata: {
          total,
          page: Math.floor(skip / take) + 1,
          pageSize: take,
          hasMore: skip + take < total
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user missions:", error);
    }
    return NextResponse.json(
      { message: "Error fetching user missions" },
      { status: 500 }
    );
  }
}
