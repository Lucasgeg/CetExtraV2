import prisma from "@/app/lib/prisma";
import { EnumMissionJob, EnumRole } from "@/store/types";
import { CreateMissionFormValues, Suggestion } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { MissionDetailApiResponse } from "@/types/MissionDetailApiResponse";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { auth } from "@clerk/nextjs/server";
import { MissionJob, MissionLocation } from "@prisma/client";
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
              in: ["accepted", "pending"]
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
        },
        invitations: {
          where: {
            status: "pending"
          },
          select: {
            id: true
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
      })),
      invitations: [
        ...mission.invitations?.map((invitation) => ({
          id: invitation.id
        })),
        ...mission.employees
          .filter((emp) => emp.status === "pending")
          .map((pendEmp) => ({
            id: pendEmp.id
          }))
      ]
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

/**
 * Met à jour une mission existante en fonction de son identifiant.
 *
 * Cette méthode vérifie d'abord les autorisations de l'utilisateur et la validité des paramètres.
 * Elle empêche la modification de certaines propriétés (localisation, dates, types de postes) si des employés ont déjà accepté ou sont en attente sur la mission.
 * Les postes acceptés ne peuvent pas être supprimés ou réduits en dessous du nombre d'employés acceptés.
 * Les informations de la mission et ses postes requis sont mises à jour dans une transaction Prisma.
 *
 * @param req - La requête HTTP contenant les nouvelles valeurs du formulaire de mission.
 * @param props - Les paramètres de la route, incluant l'identifiant de la mission.
 * @returns Une réponse HTTP indiquant le succès ou l'échec de la mise à jour, avec un message explicatif.
 *
 * @throws {Error} Si l'utilisateur n'est pas autorisé (401 Unauthorized),
 *                 si les paramètres sont invalides (400 Bad Request),
 *                 si la mission ou le créateur n'est pas trouvé (404 Not Found),
 *                 si la modification n'est pas autorisée à cause d'employés acceptés ou en attente (400 Bad Request),
 *                 ou si une erreur interne survient lors de la transaction Prisma (500 Internal Server Error).
 */
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ missionId: string }> }
): Promise<NextResponse<{ message: string }>> {
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
    return new NextResponse(JSON.stringify({ message: "Creator not found" }), {
      status: 404,
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
    additionalInfo,
    extraJobOptions
  } = (await req.json()) as CreateMissionFormValues;

  if (!location || !location.lat || !location.lon || !location.display_name) {
    return NextResponse.json(
      { message: "Location data is incomplete" },
      { status: 400 }
    );
  }

  const oldMission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      missionLocation: true,
      employees: true,
      invitations: true,
      requiredPositions: true
    }
  });

  if (!oldMission || oldMission.creatorId !== creator.company.id) {
    return NextResponse.json({ message: "Mission not found" }, { status: 404 });
  }

  if (oldMission.status !== "pending") {
    throw new ApiError("Cannot edit a mission that is not pending", 400);
  }

  if (
    oldMission.invitations.some((inv) => inv.status === "pending") ||
    oldMission.employees.some((emp) => emp.status === "pending")
  ) {
    throw new ApiError(
      "Cannot edit a mission with pending employees or invitations",
      400
    );
  }
  const acceptedEmployeesByJob = oldMission.employees
    .filter((emp) => emp.status === "accepted")
    .reduce(
      (acc, emp) => {
        // Convertir le type de job de la DB vers le format frontend (ex: "waiter" -> "WAITER")
        const jobKey = emp.missionJob.toUpperCase() as keyof typeof teamCounts;
        acc[jobKey] = (acc[jobKey] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  // Vérifier pour chaque type de job si le nouveau nombre est suffisant
  for (const [jobType, acceptedCount] of Object.entries(
    acceptedEmployeesByJob
  )) {
    const newCount = teamCounts[jobType as keyof typeof teamCounts] || 0;

    if (newCount < acceptedCount) {
      throw new ApiError(
        `Cannot reduce the number of positions for ${jobType} below ${acceptedCount} (number of accepted employees)`,
        400
      );
    }
  }
  const acceptedJobTypes = oldMission.employees
    .filter((emp) => emp.status === "accepted")
    .map((emp) => emp.missionJob.toUpperCase() as EnumMissionJob);

  const uniqueAcceptedJobTypes = [...new Set(acceptedJobTypes)];

  for (const jobType of uniqueAcceptedJobTypes) {
    if (!extraJobOptions.includes(jobType)) {
      throw new ApiError(
        `Impossible de supprimer le poste de type ${jobType} car des employés l'ont déjà
accepté`,
        400
      );
    }
  }
  if (!isSameLocation(oldMission.missionLocation, location)) {
    throw new ApiError(
      "Cannot change location of a mission with pending or accepted employees",
      400
    );
  }
  if (
    oldMission.missionStartDate.toISOString() !== missionStartDate ||
    oldMission.missionEndDate.toISOString() !== missionEndDate
  ) {
    throw new ApiError(
      "Cannot change start or end date of a mission with pending or accepted employees",
      400
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (!oldMission.missionLocationId) {
        throw new Error("Mission location ID is missing");
      }

      // 1. Mettre à jour la localisation
      const missionLocation = await tx.missionLocation.update({
        where: {
          id: oldMission.missionLocationId
        },
        data: {
          fullName: location.display_name,
          lat: location.lat,
          lon: location.lon
        }
      });
      if (!missionLocation) {
        throw new Error("Failed to update mission location");
      }

      // 2. Mettre à jour les informations de base de la mission
      const missionUpdated = await tx.mission.update({
        where: { id: missionId },
        data: {
          name: missionName,
          description: missionDescription || null,
          additionalInfo: additionalInfo || null,
          missionStartDate: new Date(missionStartDate),
          missionEndDate: new Date(missionEndDate),
          status: oldMission.status,
          missionLocationId: missionLocation.id
        }
      });

      if (!missionUpdated) {
        throw new Error("Failed to update mission");
      }

      const positionsToKeep = Object.entries(teamCounts)
        .filter(([jobType, quantity]) => {
          // Vérifier que la position est dans extraJobOptions et que la quantité est > 0
          return (
            quantity > 0 && extraJobOptions.includes(jobType as EnumMissionJob)
          );
        })
        // Convertir en MissionJob en utilisant une conversion explicite
        .map(([jobType]) => jobType.toLowerCase() as MissionJob);

      const requiredPositionsDeleted = await tx.requiredPosition.deleteMany({
        where: {
          missionId,
          NOT: {
            jobType: {
              in: positionsToKeep
            }
          }
        }
      });

      if (requiredPositionsDeleted.count < 0) {
        throw new Error("Failed to delete required positions");
      }

      // 3.2 Mettre à jour ou créer les postes
      for (const [jobType, quantity] of Object.entries(teamCounts)) {
        if (quantity <= 0) continue;

        // Convertir le type de job du frontend vers le format BD
        const dbJobType = jobType.toLowerCase();

        // Chercher si ce type de poste existe déjà
        const existingPosition = await tx.requiredPosition.findFirst({
          where: {
            missionId,
            jobType: dbJobType as MissionJob
          }
        });

        if (existingPosition) {
          // Mettre à jour la quantité si le poste existe
          await tx.requiredPosition.update({
            where: { id: existingPosition.id },
            data: { quantity }
          });
        } else {
          // Créer un nouveau poste s'il n'existe pas
          await tx.requiredPosition.create({
            data: {
              missionId,
              jobType: dbJobType as MissionJob,
              quantity
            }
          });
        }
      }

      return { id: missionId };
    });

    return NextResponse.json(
      { message: "Mission updated successfully", mission: { id: missionId } },
      { status: 200 }
    );
  } catch (error) {
    const { message, status } = handlePrismaError(error, "UpdateMission");
    return NextResponse.json({ message, status }, { status });
  }
}

function isSameLocation(
  loc1: MissionLocation | null,
  loc2: Suggestion
): boolean {
  if (!loc1) return false;

  // Comparer les coordonnées avec une petite marge d'erreur (0.0001° ≈ 11m)
  const isSameCoordinates =
    Math.abs(loc1.lat - loc2.lat) < 0.0001 &&
    Math.abs(loc1.lon - loc2.lon) < 0.0001;

  return isSameCoordinates;
}
