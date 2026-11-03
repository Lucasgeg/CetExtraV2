import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import {
  calculateDistance,
  obfuscateCoordinates
} from "@/utils/distance.utils";

/**
 * Lecture stricte d'un paramètre numérique : absent ou vide → `fallback`,
 * sinon `Number()` (refuse "12abc", contrairement à `parseFloat`).
 */
const parseNumberParam = (
  value: string | null,
  fallback = Number.NaN
): number => {
  if (value === null || value.trim() === "") return fallback;
  return Number(value);
};

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId || sessionClaims.publicMetadata.role !== "company") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const lat = parseNumberParam(searchParams.get("lat"));
    const lon = parseNumberParam(searchParams.get("lon"));
    const radius = parseNumberParam(searchParams.get("radius"), 50);
    const limit = parseNumberParam(searchParams.get("limit"), 100); // Limite de résultats
    const page = parseNumberParam(searchParams.get("page"), 1); // Page pour pagination

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        {
          error:
            "Coordonnées latitude ([-90, 90]) et longitude ([-180, 180]) requises"
        },
        { status: 400 }
      );
    }
    if (!Number.isFinite(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "Le rayon doit être un nombre strictement positif" },
        { status: 400 }
      );
    }
    if (
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      !Number.isSafeInteger(page) ||
      page < 1
    ) {
      return NextResponse.json(
        { error: "limit et page doivent être des entiers ≥ 1" },
        { status: 400 }
      );
    }
    const skip = (page - 1) * limit;

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

      // Colonnes `String` en base : "" ou valeur illisible → extra ignoré.
      // On trace l'id seulement, jamais les valeurs (domicile).
      const exactLat = Number.parseFloat(user.userLocation.lat);
      const exactLon = Number.parseFloat(user.userLocation.lon);
      if (!Number.isFinite(exactLat) || !Number.isFinite(exactLon)) {
        console.warn(
          `[users/nearby] Localisation illisible, extra ignoré : ${user.id}`
        );
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
