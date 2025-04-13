import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

enum EnumMissionSelector {
  ALL = "all",
  INCOMING = "incoming",
  PAST = "past",
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const { userId: clerkId } = await auth();

  const params = await props.params;
  const { userId } = params;

  if (!clerkId || clerkId !== userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const missionSelector: EnumMissionSelector =
    (searchParams.get("missionSelector") as EnumMissionSelector) ||
    EnumMissionSelector.ALL;
  const take = searchParams.get("take");
  const startDateCondition = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    switch (missionSelector) {
      case EnumMissionSelector.INCOMING:
        return {
          gte: today,
        };
      case EnumMissionSelector.PAST:
        return {
          lt: today,
          gte: firstDayOfMonth,
        };
      default:
        return {};
    }
  };

  const getMissions = async () => {
    try {
      const missions = await prisma.userMission.findMany({
        where: {
          user: {
            clerkId: userId,
          },
          start_date: startDateCondition(),
        },
        select: {
          id: true,
          start_date: true,
          duration: true,
          mission: {
            select: {
              id: true,
              name: true,
              missionLocation: {
                select: {
                  fullName: true,
                },
              },
              creator: {
                select: {
                  company_name: true,
                },
              },
            },
          },
        },
        take: take ? parseInt(take) : undefined,
        orderBy: {
          start_date: "asc",
        },
      });
      const totalDuration = missions.reduce((acc, mission) => {
        return acc + mission.duration;
      }, 0);
      return NextResponse.json({ ...missions, totalDuration }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Error fetching missions" },
        { status: 500 }
      );
    }
  };

  return await getMissions();
}
