import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  calculateDistance,
  obfuscateCoordinates
} from "@/utils/distance.utils";

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
    const limit = parseInt(searchParams.get("limit") || "100", 10); // Limite de résultats
    const page = parseInt(searchParams.get("page") || "1", 10); // Page pour pagination
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

    // RGPD : `userLocation` est le domicile de l'extra. La position exacte ne
    // sort jamais de cette boucle : coordonnées, distance, filtre de rayon et
    // tri sont tous calculés sur la position brouillée (grille ~1 km).
    const nearbyUsers = users.flatMap((user) => {
      if (!user.userLocation) return [];

      // Colonnes `String` en base : "" ou valeur illisible → extra ignoré
      const exactLat = Number.parseFloat(user.userLocation.lat);
      const exactLon = Number.parseFloat(user.userLocation.lon);
      if (!Number.isFinite(exactLat) || !Number.isFinite(exactLon)) {
        return [];
      }

      const displayed = obfuscateCoordinates(exactLat, exactLon, user.id);
      const distance =
        Math.round(
          calculateDistance(lat, lon, displayed.lat, displayed.lon) * 10
        ) / 10;

      if (!(distance <= radius)) return [];

      const firstName = user.extra?.first_name || "";
      const lastName = user.extra?.last_name || "";

      return [
        {
          id: user.id,
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
          lat: displayed.lat,
          lon: displayed.lon,
          distance,
          job: Array.isArray(user.extra?.missionJobs)
            ? user.extra.missionJobs.join(", ")
            : user.extra?.missionJobs || "Non spécifié",
          profileImageUrl: user.profilePictureUrl || ""
        }
      ];
    });

    // Trier par distance (brouillée) et renvoyer
    return NextResponse.json({
      users: nearbyUsers.sort((a, b) => a.distance - b.distance),
      total: nearbyUsers.length,
      page,
      limit,
      radius,
      center: { lat, lon }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
