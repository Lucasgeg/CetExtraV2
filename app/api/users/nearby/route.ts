import prisma from "@/app/lib/prisma";
import { decrypt } from "@/utils/crypto";
import {
  calculateDistance,
  randomizeCoordinatesAdvanced
} from "@/utils/distance.utils";
import { getKey } from "@/utils/keyCache";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId || sessionClaims.publicMetadata.role !== "company") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const key = await getKey();
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
        const decryptedUserLat = Number(decrypt(user.userLocation.lat, key));
        const decryptedUserLon = Number(decrypt(user.userLocation.lon, key));
        // Calculer la distance et vérifier si elle est dans le rayon

        const distance = calculateDistance(
          lat,
          lon,
          decryptedUserLat,
          decryptedUserLon
        );
        return distance <= radius;
      })
      .map((user) => {
        if (!user.userLocation) {
          return null; // Ignorer les utilisateurs sans localisation
        }
        const decryptedLat = Number(decrypt(user.userLocation.lat, key));
        const decryptedLon = Number(decrypt(user.userLocation.lon, key));
        const distance = calculateDistance(
          lat,
          lon,
          decryptedLat,
          decryptedLon
        );

        const displayCoordinates = preservePrivacy
          ? randomizeCoordinatesAdvanced(decryptedLat, decryptedLon, 0.1, 0.8)
          : {
              lat: decryptedLat,
              lon: decryptedLon
            };
        const decryptedFirstName = user.extra?.first_name
          ? decrypt(user.extra.first_name, key)
          : "";
        const decryptedLastName = user.extra?.last_name
          ? decrypt(user.extra.last_name, key)
          : "";
        const decryptedProfilePictureUrl = user.profilePictureUrl
          ? decrypt(user.profilePictureUrl, key)
          : "";

        return {
          id: user.id,
          name: `${decryptedFirstName} ${decryptedLastName}`.trim(),
          firstName: decryptedFirstName,
          lastName: decryptedLastName,
          lat: displayCoordinates.lat,
          lon: displayCoordinates.lon,
          distance,
          job: Array.isArray(user.extra?.missionJobs)
            ? user.extra.missionJobs.join(", ")
            : user.extra?.missionJobs || "Non spécifié",
          isPrivacyProtected: preservePrivacy,
          profileImageUrl: decryptedProfilePictureUrl
        };
      });

    // Trier par distance et renvoyer
    const filteredNearbyUsers = nearbyUsers.filter(
      (user): user is NonNullable<typeof user> => user !== null
    );
    return NextResponse.json({
      users: filteredNearbyUsers.sort((a, b) => a.distance - b.distance),
      total: filteredNearbyUsers.length,
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
