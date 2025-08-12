"use server";
import prisma from "@/app/lib/prisma";
import { EnumRole, UserSignUpSchema } from "@/store/types";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { encrypt } from "@/utils/crypto";
import { convertToDbMissionJob } from "@/utils/enum";
import { getKey } from "@/utils/keyCache";
import { createClerkClient } from "@clerk/nextjs/server";
import { Prisma, UserMissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");

    let data: UserSignUpSchema;
    let profilePhoto: File | null = null;

    if (contentType?.includes("multipart/form-data")) {
      // Traitement des données FormData

      const formData = await req.formData();

      const userDataString = formData.get("userData") as string;
      data = JSON.parse(userDataString);
      profilePhoto = formData.get("profilePhoto") as File | null;
    } else {
      // Traitement JSON classique (pour la compatibilité)
      data = await req.json();
    }

    if (data.role === EnumRole.EXTRA) {
      return await createExtra(data, profilePhoto);
    }
    if (data.role === EnumRole.COMPANY) {
      return await createCompany(data, profilePhoto);
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user: ", stackTrace: error },
      { status: 500 }
    );
  }
}

const createExtra = async (
  data: UserSignUpSchema,
  profilePhoto: File | null = null
) => {
  try {
    // Récupération de la clé de chiffrement
    const key = await getKey();

    // Préparer les données chiffrées pour l'utilisateur extra
    const encryptedExtraData = {
      first_name: encrypt(data.extra?.first_name || "", key),
      last_name: encrypt(data.extra?.last_name || "", key),
      phone: data.extra?.phone ? encrypt(data.extra?.phone, key) : null,
      email: encrypt(data.email, key),
      // Conversion et chiffrement de la date de naissance au format ISO
      birthdate: data.extra?.birthdate
        ? encrypt(
            new Date(data.extra.birthdate).toISOString().split("T")[0],
            key
          )
        : ""
    };

    const encryptedLocationData = {
      fullName: encrypt(data.location?.display_name || "", key),
      lat: encrypt(data.location?.lat.toString() || "", key),
      lon: encrypt(data.location?.lon.toString() || "", key)
    };

    const response: TransactionResult = await prisma.$transaction(
      async (tx) => {
        if (!data.extra || !data.location || !data.extra.birthdate) {
          return {
            success: false,
            error: "Missing required fields for extra user",
            status: 400
          };
        }
        let user;

        try {
          user = await tx.user.create({
            data: {
              email: encryptedExtraData.email,
              role: data.role,
              clerkId: data.clerkId,
              extra: {
                create: {
                  first_name: encryptedExtraData.first_name,
                  last_name: encryptedExtraData.last_name,
                  birthdateIso: encryptedExtraData.birthdate,
                  max_travel_distance: data.extra.max_travel_distance,
                  phone: encryptedExtraData.phone,
                  missionJobs: {
                    createMany: {
                      data: data.extra.missionJob.map((job) => ({
                        experience: job.experience,
                        missionJob: convertToDbMissionJob(job.missionJob)
                      }))
                    }
                  }
                }
              },
              description: encrypt(data.description || "", key),
              userLocation: {
                create: {
                  fullName: encryptedLocationData.fullName,
                  lat: encryptedLocationData.lat,
                  lon: encryptedLocationData.lon
                }
              }
            }
          });
        } catch (error: unknown) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            console.error("Prisma error:", error);
            return {
              success: false,
              error: "Cette adresse email est déjà utilisée",
              status: 409
            };
          }
          return {
            success: false,
            error: "Erreur lors de la création du compte",
            status: 500
          };
        }

        // Check if the user have pending invitations
        const pendingInvitations = await tx.invitation.findMany({
          where: {
            email: data.email
          }
        });
        // Transfer invitation to userMission if any
        if (pendingInvitations.length > 0) {
          const userMissions = pendingInvitations.map((invitation) => ({
            userId: user.id,
            missionId: invitation.missionId,
            missionStartDate: invitation.missionStartDate,
            missionEndDate: invitation.missionEndDate,
            missionJob: invitation.missionJob,
            hourlyRate: invitation.hourlyRate,
            status: UserMissionStatus.pending
          }));
          try {
            await tx.userMission.createMany({
              data: userMissions
            });
          } catch (error) {
            if (error instanceof Error && error.message) {
              return {
                success: false,
                error: error.message,
                status: 409
              };
            }
          }

          // Delete the invitations after transferring
          try {
            await tx.invitation.deleteMany({
              where: {
                email: data.email
              }
            });
          } catch (error) {
            if (error instanceof Error && error.stack) {
              console.error("Error deleting invitations:", error.stack);
            }
            if (error instanceof Error && error.message) {
              return {
                success: false,
                error: error.message,
                status: 409
              };
            }
          }
        }

        return { success: true, data: user };
      }
    );

    if (!response.success) {
      throw new ApiError(
        response.error || "Échec de la création du compte",
        response.status || 500
      );
    }

    try {
      // Mise à jour des métadonnées Clerk
      await clerkClient.users.updateUserMetadata(data.clerkId, {
        publicMetadata: {
          role: data.role
        }
      });
      // Mise à jour de la photo de profil si elle existe
      if (profilePhoto) {
        await clerkClient.users.updateUserProfileImage(data.clerkId, {
          file: profilePhoto
        });
      }
    } catch (clerkError) {
      console.error("Failed to update Clerk user:", clerkError);

      // Rollback en cas d'erreur
      await prisma.user.delete({
        where: { clerkId: data.clerkId }
      });
      await clerkClient.users.deleteUser(data.clerkId);
      throw new ApiError("Failed to update user profile", 500);
    }

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during the process:", error);
    try {
      await clerkClient.users.deleteUser(data.clerkId);
    } catch (clerkError) {
      console.error("Error cleaning up Clerk user:", clerkError);
    }

    return NextResponse.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "Erreur lors de la création du compte"
      },
      { status: error instanceof ApiError ? error.status : 500 }
    );
  }
};

const createCompany = async (
  data: UserSignUpSchema,
  profilePhoto: File | null = null
) => {
  if (!data.company || !data.location) {
    return NextResponse.json(
      { message: "Missing required company data" },
      { status: 400 }
    );
  }

  try {
    // Récupération de la clé de chiffrement
    const key = await getKey();

    // Chiffrer les données de l'entreprise
    const encryptedCompanyData = {
      company_name: encrypt(data.company.company_name, key),
      contactFirstName: encrypt(data.company.contactFirstName, key),
      contactLastName: encrypt(data.company.contactLastName, key),
      companyEmail: encrypt(data.email, key),

      company_phone: data.company.company_phone
        ? encrypt(data.company.company_phone, key)
        : null
    };

    // Chiffrer les données de localisation
    const encryptedLocationData = {
      fullName: encrypt(data.location.display_name, key),
      lat: encrypt(data.location.lat.toString(), key),
      lon: encrypt(data.location.lon.toString(), key)
    };

    await prisma.user.create({
      data: {
        email: encryptedCompanyData.companyEmail,
        role: data.role,
        clerkId: data.clerkId,
        company: {
          create: {
            company_name: encryptedCompanyData.company_name,
            contactFirstName: encryptedCompanyData.contactFirstName,
            contactLastName: encryptedCompanyData.contactLastName,
            company_phone: encryptedCompanyData.company_phone
          }
        },
        userLocation: {
          create: {
            fullName: encryptedLocationData.fullName,
            lat: encryptedLocationData.lat,
            lon: encryptedLocationData.lon
          }
        }
      }
    });

    // Mise à jour des métadonnées et photo Clerk
    await clerkClient.users.updateUserMetadata(data.clerkId, {
      publicMetadata: {
        role: data.role
      }
    });

    if (profilePhoto) {
      await clerkClient.users.updateUserProfileImage(data.clerkId, {
        file: profilePhoto
      });
    }

    return NextResponse.json({ message: "Company user created successfully" });
  } catch (error) {
    await clerkClient.users.deleteUser(data.clerkId);
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", stackTrace: error },
      { status: 500 }
    );
  }
};
