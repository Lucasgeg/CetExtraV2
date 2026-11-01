import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import type { PrismaMissionJob } from "@/store/types";
import type { GetUserByIdResponse } from "@/types/GetUserByIdResponse";

/**
 * Profil public d'un extra, consulté par une entreprise (fiche ouverte depuis
 * la carte pour l'inviter). Minimisation RGPD : ni email, ni téléphone, ni
 * date de naissance ; une cible qui n'est pas un extra renvoie 404 (aucune
 * fiche entreprise exposée). Le `select` ne lit que les champs renvoyés.
 */
export async function GET(
  _request: Request,
  props: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId: currentUserId, sessionClaims } = await auth();

  if (!currentUserId || sessionClaims?.publicMetadata?.role !== "company") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { userId } = await props.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        description: true,
        profilePictureUrl: true,
        extra: {
          select: {
            first_name: true,
            last_name: true,
            missionJobs: {
              select: {
                missionJob: true,
                experience: true
              }
            }
          }
        }
      }
    });
    if (!user?.extra) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response: GetUserByIdResponse = {
      id: userId,
      description: user.description || undefined,
      profilePictureUrl: user.profilePictureUrl || undefined,
      extra: {
        firstName: user.extra.first_name,
        lastName: user.extra.last_name,
        missionJobs: user.extra.missionJobs.map((job) => ({
          missionJob: job.missionJob as PrismaMissionJob,
          experience: job.experience
        }))
      }
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
