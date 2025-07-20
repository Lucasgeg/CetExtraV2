import prisma from "@/app/lib/prisma";
import { EnumMissionSelector } from "@/types/api";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { auth } from "@clerk/nextjs/server";
import { MissionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Fonction pour construire l'objet de sélection
const buildSelectObject = (fields: string[] | null) => {
  if (!fields || fields.length === 0) {
    // Sélection par défaut
    return {
      id: true,
      name: true,
      missionStartDate: true,
      missionEndDate: true,
      status: true,
      missionLocation: {
        select: {
          fullName: true
        }
      }
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectObj: any = {};

  fields.forEach((field) => {
    switch (field) {
      case "id":
        selectObj.id = true;
        break;
      case "name":
        selectObj.name = true;
        break;
      case "description":
        selectObj.description = true;
        break;
      case "missionStartDate":
        selectObj.missionStartDate = true;
        break;
      case "missionEndDate":
        selectObj.missionEndDate = true;
        break;
      case "status":
        selectObj.status = true;
        break;
      case "additionalInfo":
        selectObj.additionalInfo = true;
        break;
      case "missionLocation.fullName":
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.fullName = true;
        break;
      case "missionLocation.lat":
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.lat = true;
        break;
      case "missionLocation.lon":
        if (!selectObj.missionLocation) {
          selectObj.missionLocation = { select: {} };
        }
        selectObj.missionLocation.select.lon = true;
        break;
      case "requiredPositions":
        selectObj.requiredPositions = {
          select: {
            id: true,
            jobType: true,
            quantity: true
          }
        };
        break;
      case "employees":
        selectObj.employees = {
          select: {
            id: true,
            userId: true,
            missionJob: true,
            status: true,
            user: {
              select: {
                id: true,
                email: true,
                extra: {
                  select: {
                    first_name: true,
                    last_name: true,
                    phone: true
                  }
                }
              }
            }
          }
        };
        break;
      case "invitations":
        selectObj.Invitation = {
          select: {
            id: true,
            email: true,
            missionJob: true,
            hourlyRate: true,
            createdAt: true
          }
        };
        break;
    }
  });

  // Toujours inclure l'ID pour référence
  selectObj.id = true;

  return selectObj;
};

/**
 * Handles GET requests to retrieve missions for a specific company.
 *
 * - Authenticates the user using Clerk.
 * - Validates the provided `companyId` parameter.
 * - Checks if the authenticated user belongs to the requested company.
 * - Supports pagination (`take`, `skip`), sorting (`sortOrder`), and field selection (`fields`).
 * - Filters missions based on the `missionSelector` parameter (e.g., incoming or past missions).
 * - Dynamically constructs the Prisma select object based on requested fields.
 * - Returns a paginated list of missions, total count, and pagination metadata.
 * - Handles and logs errors, returning appropriate HTTP status codes.
 *
 * @param req - The Next.js API request object.
 * @param params - An object containing the route parameters, including `companyId`.
 * @returns A JSON response containing the list of missions, total count, and pagination metadata.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // 1. Authentification
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Validation des paramètres
    const { companyId } = await params;
    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json(
        { message: "Invalid companyId parameter" },
        { status: 400 }
      );
    }

    // 3. Vérification des autorisations
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        role: true,
        company: {
          select: { id: true }
        }
      }
    });

    if (!user || user.company?.id !== companyId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4. Récupération des paramètres de requête
    const searchParams = req.nextUrl.searchParams;
    const take = searchParams.get("take")
      ? parseInt(searchParams.get("take")!)
      : 10;
    const skip = searchParams.get("skip")
      ? parseInt(searchParams.get("skip")!)
      : 0;
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Paramètre fields pour la sélection de champs spécifiques
    const fieldsParam = searchParams.get("fields");
    const requestedFields = fieldsParam ? fieldsParam.split(",") : null;

    // Condition de filtrage par statut
    const missionSelector: EnumMissionSelector =
      (searchParams.get("missionSelector") as EnumMissionSelector) ||
      EnumMissionSelector.INCOMING;

    // Construction des conditions de recherche
    const whereCondition = {
      creatorId: companyId,
      status:
        missionSelector === EnumMissionSelector.PAST
          ? MissionStatus.completed
          : { in: [MissionStatus.active, MissionStatus.pending] }
    };

    // Comptage total pour pagination
    const totalCount = await prisma.mission.count({
      where: whereCondition
    });

    // Construire l'objet de sélection basé sur les champs demandés
    const selectObject = buildSelectObject(requestedFields);

    // Exécution de la requête avec les champs sélectionnés
    const missions = await prisma.mission.findMany({
      where: whereCondition,
      select: selectObject,
      take,
      skip,
      orderBy: {
        missionStartDate: sortOrder === "asc" ? "asc" : "desc"
      }
    });

    // 7. Transformation des données pour l'affichage, seulement si les champs nécessaires sont présents
    const formattedMissions = missions.map((mission) => {
      // Version simplifiée si seulement les champs de base sont demandés
      if (
        !mission.requiredPositions &&
        !mission.employees &&
        !mission.Invitation
      ) {
        return mission;
      }

      return {
        ...mission,
        requiredPositions: mission.requiredPositions || []
      };
    });

    // 8. Renvoyer la réponse structurée
    return NextResponse.json(
      {
        missions: formattedMissions,
        total: totalCount,
        metadata: {
          total: totalCount,
          page: Math.floor(skip / take) + 1,
          pageSize: take,
          totalPages: Math.ceil(totalCount / take),
          hasMore: skip + take < totalCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const { message } = handlePrismaError(error, "GetCompanyMissions");
    console.error("Error fetching company missions:", message);

    return NextResponse.json(
      { message: "Failed to fetch company missions" },
      { status: 500 }
    );
  }
}
