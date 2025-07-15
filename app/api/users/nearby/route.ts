import prisma from "@/app/lib/prisma";
import {
  calculateDistance,
  randomizeCoordinatesAdvanced
} from "@/utils/distance.utils";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

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

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Coordonnées latitude et longitude requises" },
        { status: 400 }
      );
    }

    // Récupérer les utilisateurs extras avec les infos de base
    const users = await prisma.user.findMany({
      where: {
        role: "extra",
        userLocation: {
          isNot: null
        }
      },
      select: {
        id: true,
        email: true,
        clerkId: true,
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
        }
      }
    });

    const nearbyUsers = users
      .filter((user) => {
        if (!user.userLocation) return false;

        // Utiliser les coordonnées originales pour le filtrage
        const distance = calculateDistance(
          lat,
          lon,
          user.userLocation.lat,
          user.userLocation.lon
        );

        return distance <= radius;
      })
      .map(async (user) => {
        // Récupérer les informations Clerk de l'utilisateur
        let clerkUser;
        let profileImageUrl = null;

        try {
          clerkUser = await clerkClient.users.getUser(user.clerkId);
          profileImageUrl = clerkUser.hasImage ? clerkUser.imageUrl : null;
        } catch (error) {
          console.warn(
            `Impossible de récupérer l'utilisateur Clerk ${user.id}:`,
            error
          );
        }

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
          distance: calculateDistance(
            lat,
            lon,
            user.userLocation!.lat,
            user.userLocation!.lon
          ),
          job: Array.isArray(user.extra?.missionJobs)
            ? user.extra.missionJobs.join(", ")
            : user.extra?.missionJobs || "Non spécifié",
          isPrivacyProtected: preservePrivacy,
          profileImageUrl
        };
      });
    const resolvedUsers = await Promise.all(nearbyUsers);

    return NextResponse.json({
      users: resolvedUsers.sort((a, b) => a.distance - b.distance),
      total: resolvedUsers.length,
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
