import prisma from "@/app/lib/prisma";
import {
  calculateDistance,
  randomizeCoordinatesAdvanced
} from "@/utils/distance.utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId || sessionClaims.publicMetadata.role !== "company") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lon = parseFloat(searchParams.get("lon") || "0");
    const radius = parseFloat(searchParams.get("radius") || "50");
    const preservePrivacy = searchParams.get("privacy") !== "false"; // Par défaut true
    const limit = parseInt(searchParams.get("limit") || "100"); // Limite de résultats
    const page = parseInt(searchParams.get("page") || "1"); // Page pour pagination
    const skip = (page - 1) * limit;

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Coordonnées latitude et longitude requises" },
        { status: 400 }
      );
    }

    // Récupérer les utilisateurs avec filtrage optimisé
    const users = await prisma.user.findMany({
      where: {
        role: "extra",
        userLocation: {
          isNot: null
        }
      },
      select: {
        id: true,
        userLocation: {
          select: {
            lat: true,
            lon: true
          }
        },
        extra: {
          select: {
            missionJobs: true,
            first_name: true,
            last_name: true
          }
        },
        profilePictureUrl: true
      },
      take: limit,
      skip: skip
    });

    // Filtre et traitement des utilisateurs
    const nearbyUsers = users
      .filter((user) => {
        if (!user.userLocation) return false;
        const distance = calculateDistance(
          lat,
          lon,
          user.userLocation.lat,
          user.userLocation.lon
        );
        return distance <= radius;
      })
      .map((user) => {
        const distance = calculateDistance(
          lat,
          lon,
          user.userLocation!.lat,
          user.userLocation!.lon
        );

        const displayCoordinates = preservePrivacy
          ? randomizeCoordinatesAdvanced(
              user.userLocation!.lat,
              user.userLocation!.lon,
              0.1,
              0.8
            )
          : {
              lat: user.userLocation!.lat,
              lon: user.userLocation!.lon
            };

        return {
          id: user.id,
          name: `${user.extra?.first_name || ""} ${user.extra?.last_name || ""}`.trim(),
          firstName: user.extra?.first_name || "",
          lastName: user.extra?.last_name || "",
          lat: displayCoordinates.lat,
          lon: displayCoordinates.lon,
          distance,
          job: Array.isArray(user.extra?.missionJobs)
            ? user.extra.missionJobs.join(", ")
            : user.extra?.missionJobs || "Non spécifié",
          isPrivacyProtected: preservePrivacy,
          profileImageUrl: user.profilePictureUrl || null
        };
      });

    // Trier par distance et renvoyer
    return NextResponse.json({
      users: nearbyUsers.sort((a, b) => a.distance - b.distance),
      total: nearbyUsers.length,
      page,
      limit,
      radius,
      center: { lat, lon },
      privacyProtected: preservePrivacy
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
