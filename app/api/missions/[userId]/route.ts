import prisma from "@/app/lib/prisma";
import { AllowedFields, EnumMissionSelector } from "@/types/api";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const buildSelectObject = (fields: string[] | null, isCompany: boolean) => {
  if (!fields) {
    // Sélection par défaut selon le type
    return isCompany
      ? {
          name: true,
          id: true,
          mission_start_date: true,
          missionLocation: {
            select: {
              fullName: true
            }
          }
        }
      : {
          id: true,
          start_date: true,
          duration: true,
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
        };
  }

  // Validation des champs demandés
  const validFields = fields.filter((field) =>
    Object.values(AllowedFields).includes(field as AllowedFields)
  );

  if (validFields.length === 0) {
    throw new Error("Aucun champ valide spécifié");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectObj: any = {};

  validFields.forEach((field) => {
    switch (field as AllowedFields) {
      // Champs directs de Mission
      case AllowedFields.ID:
        selectObj.id = true;
        break;
      case AllowedFields.NAME:
        selectObj.name = true;
        break;
      case AllowedFields.DESCRIPTION:
        selectObj.description = true;
        break;
      case AllowedFields.MISSION_START_DATE:
        selectObj.mission_start_date = true;
        break;
      case AllowedFields.MISSION_END_DATE:
        selectObj.mission_end_date = true;
        break;
      case AllowedFields.ADDITIONAL_INFO:
        selectObj.additionalInfo = true;
        break;

      // Champs de MissionLocation
      case AllowedFields.LOCATION_FULL_NAME:
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.fullName = true;
        break;
      case AllowedFields.LOCATION_LAT:
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.lat = true;
        break;
      case AllowedFields.LOCATION_LON:
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.lon = true;
        break;

      // Champs de Creator
      case AllowedFields.CREATOR_COMPANY_NAME:
        if (isCompany) {
          // Pour les missions de company, on n'a pas besoin du creator
          break;
        }
        if (!selectObj.mission) {
          selectObj.mission = { select: {} };
        }
        if (!selectObj.mission.select.creator) {
          selectObj.mission.select.creator = { select: {} };
        }
        selectObj.mission.select.creator.select.company_name = true;
        break;

      // Champs UserMission (pour les extras)
      case AllowedFields.START_DATE:
        if (!isCompany) {
          selectObj.start_date = true;
        }
        break;
      case AllowedFields.DURATION:
        if (!isCompany) {
          selectObj.duration = true;
        }
        break;

      default:
        break;
    }
  });

  return selectObj;
};

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const params = await props.params;
    const { userId } = params;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { message: "Invalid userId parameter" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const missionSelector: EnumMissionSelector =
      (searchParams.get("missionSelector") as EnumMissionSelector) ||
      EnumMissionSelector.ALL;

    const take = searchParams.get("take");
    const skip = searchParams.get("skip");
    const isCompany: boolean = searchParams.get("isCompany") === "true";

    // Validation des paramètres
    if (take && (isNaN(parseInt(take)) || parseInt(take) < 1)) {
      return NextResponse.json(
        { message: "Invalid take parameter" },
        { status: 400 }
      );
    }

    if (skip && (isNaN(parseInt(skip)) || parseInt(skip) < 0)) {
      return NextResponse.json(
        { message: "Invalid skip parameter" },
        { status: 400 }
      );
    }

    const fieldsParam = searchParams.get("fields");
    const requestedFields = fieldsParam ? fieldsParam.split(",") : null;
    let selectObject;

    try {
      selectObject = buildSelectObject(requestedFields, isCompany);
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Invalid fields" },
        { status: 400 }
      );
    }

    const startDateCondition = () => {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      switch (missionSelector) {
        case EnumMissionSelector.INCOMING:
          return { gte: today };
        case EnumMissionSelector.PAST:
          return { lt: today, gte: firstDayOfMonth };
        default:
          return {};
      }
    };

    const getUserMissions = async () => {
      if (clerkId !== userId) {
        return NextResponse.json(
          { message: "Forbidden: Cannot access other user's missions" },
          { status: 403 }
        );
      }

      try {
        const missions = await prisma.userMission.findMany({
          where: {
            user: { clerkId: userId },
            start_date: startDateCondition()
          },
          select: selectObject,
          take: take ? parseInt(take) : undefined,
          skip: skip ? parseInt(skip) : undefined,
          orderBy: { start_date: "asc" }
        });

        const totalDuration = missions.reduce((acc, mission) => {
          return acc + (mission.duration || 0);
        }, 0);

        return NextResponse.json({ missions, totalDuration }, { status: 200 });
      } catch (error) {
        console.error("Error fetching user missions:", error);
        return NextResponse.json(
          { message: "Failed to fetch user missions" },
          { status: 500 }
        );
      }
    };

    const getCompanyMissions = async () => {
      try {
        const user = await prisma.user.findUnique({
          where: { clerkId },
          select: {
            company: {
              select: { id: true }
            }
          }
        });

        if (!user?.company) {
          return NextResponse.json(
            { message: "User has no associated company" },
            { status: 404 }
          );
        }

        if (user.company.id !== userId) {
          return NextResponse.json(
            { message: "Forbidden: Cannot access other company's missions" },
            { status: 403 }
          );
        }

        const whereCondition = {
          creatorId: userId,
          mission_start_date: startDateCondition()
        };

        // Get total count for pagination
        const totalCount = await prisma.mission.count({
          where: whereCondition
        });

        const missions = await prisma.mission.findMany({
          where: whereCondition,
          select: selectObject,
          take: take ? parseInt(take) : undefined,
          skip: skip ? parseInt(skip) : undefined,
          orderBy: { mission_start_date: "asc" }
        });

        return NextResponse.json(
          {
            missions,
            total: totalCount
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error fetching company missions:", error);
        return NextResponse.json(
          { message: "Failed to fetch company missions" },
          { status: 500 }
        );
      }
    };

    return isCompany ? await getCompanyMissions() : await getUserMissions();
  } catch (error) {
    console.error("Unexpected error in missions API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
