import prisma from "@/app/lib/prisma";
import { EnumMissionJob, EnumRole } from "@/store/types";
import { isEmailValid } from "@/utils/string";
import { auth } from "@clerk/nextjs/server";
import { MissionJob } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type MissionInviteBody = {
  receiverEmail: string;
  expeditorUserId: string;
  missionJob: EnumMissionJob;
  missionStartDate: string;
  duration: number;
};

export default async function POST(
  req: Request,
  props: { params: Promise<{ missionId: string }> }
) {
  const { sessionClaims, userId } = await auth();
  const { missionId } = await props.params;
  const {
    expeditorUserId,
    receiverEmail,
    duration,
    missionJob,
    missionStartDate
  } = (await req.json()) as MissionInviteBody;

  if (
    !sessionClaims ||
    sessionClaims.publicMetadata.role !== EnumRole.COMPANY ||
    userId !== expeditorUserId
  ) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401
    });
  }

  if (
    !missionId ||
    !expeditorUserId ||
    !receiverEmail ||
    !isEmailValid(receiverEmail)
  ) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  try {
    const company = await prisma.company.findUnique({
      where: {
        userId: expeditorUserId
      },
      select: {
        createdMissions: {
          where: {
            id: missionId
          },
          select: {
            name: true,
            description: true,
            mission_start_date: true,
            mission_end_date: true,
            missionLocation: {
              select: {
                fullName: true
              }
            }
          }
        },
        company_name: true
      }
    });

    const userFromDb = await prisma.user.findUnique({
      where: { email: receiverEmail },
      select: {
        id: true
      }
    });

    if (userFromDb !== null) {
      const userMission = await createUserMissionFromDb(
        {
          receiverEmail,
          expeditorUserId,
          missionJob,
          missionStartDate: new Date(missionStartDate).toISOString(),
          duration
        },
        missionId,
        userFromDb.id
      );
    } else {
      const userMission = await createUserInvitation(
        {
          receiverEmail,
          expeditorUserId,
          missionJob,
          missionStartDate: new Date(missionStartDate).toISOString(),
          duration
        },
        missionId
      );
    }
  } catch (error) {
    console.error("Error fetching company or mission:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500
    });
  }
}

const createUserMissionFromDb = async (
  body: MissionInviteBody,
  missionId: string,
  userId: string
) => {
  return await prisma.userMission.create({
    data: {
      userId: userId,
      missionId: missionId,
      missionStartDate: new Date(body.missionStartDate),
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      duration: body.duration,
      hourly_rate: 0,
      status: "pending"
    }
  });
};

const createUserInvitation = async (
  body: MissionInviteBody,
  missionId: string
) => {
  return await prisma.invitation.create({
    data: {
      email: body.receiverEmail,
      missionId: missionId,
      duration: body.duration,
      missionJob: body.missionJob.toLowerCase() as MissionJob,
      missionStartDate: new Date(body.missionStartDate),
      hourlyRate: 0
    }
  });
};
