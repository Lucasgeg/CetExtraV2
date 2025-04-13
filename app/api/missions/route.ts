import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
    select: {
      company: {
        select: {
          id: true,
        },
      },
    },
  });

  const createMission = async () => {
    if (!user?.company?.id) {
      return new NextResponse("Not found", { status: 404 });
    }

    await prisma.mission.create({
      data: {
        mission_date: new Date(),
        name: "Mission 1",
        description: "Mission 1 description",
        creatorId: user.company.id,
        missionLocationId: "1",
      },
    });
  };
  return new Response("ok");
}
