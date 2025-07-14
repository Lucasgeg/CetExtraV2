"use server";
import prisma from "@/app/lib/prisma";
import { EnumRole, UserSignUpSchema } from "@/store/types";
import { TransactionResult } from "@/types/api";
import { ApiError } from "@/types/ApiError";
import { createClerkClient } from "@clerk/nextjs/server";
import { MissionJob, Prisma, UserMissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});

export async function POST(req: Request) {
  try {
    const data: UserSignUpSchema = await req.json();

    if (data.role === EnumRole.EXTRA) {
      return await createExtra(data);
    }
    if (data.role === EnumRole.COMPANY) {
      return await createCompany(data);
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating user: ", stackTrace: error },
      { status: 500 }
    );
  }
}

const createExtra = async (data: UserSignUpSchema) => {
  try {
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
              email: data.email,
              role: data.role,
              clerkId: data.clerkId,
              extra: {
                create: {
                  first_name: data.extra.first_name,
                  last_name: data.extra.last_name,
                  birthdate: data.extra.birthdate,
                  missionJobs: data.extra.missionJob.map(
                    (job) => job.toLowerCase() as MissionJob
                  ),
                  max_travel_distance: data.extra.max_travel_distance,
                  phone: data.extra.phone
                }
              },
              userLocation: {
                create: {
                  fullName: data.location.display_name,
                  lat: data.location.lat,
                  lon: data.location.lon
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
      await clerkClient.users.updateUserMetadata(data.clerkId, {
        publicMetadata: {
          role: data.role
        }
      });
    } catch (clerkError) {
      console.error("Failed to update Clerk user metadata:", clerkError);

      await prisma.user.delete({
        where: { clerkId: data.clerkId }
      });
      await clerkClient.users.deleteUser(data.clerkId);
      throw new ApiError("Failed to update user metadata", 500);
    }

    return NextResponse.json({ message: "User created" });
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

const createCompany = async (data: UserSignUpSchema) => {
  if (!data.company || !data.location) {
    return;
  }
  try {
    await prisma.user.create({
      data: {
        email: data.email,
        role: data.role,
        clerkId: data.clerkId,
        company: {
          create: {
            company_name: data.company.company_name,
            contactFirstName: data.company.contactFirstName,
            contactLastName: data.company.contactLastName,
            company_phone: data.company.company_phone
          }
        },
        userLocation: {
          create: {
            fullName: data.location.display_name,
            lat: data.location.lat,
            lon: data.location.lon
          }
        }
      }
    });
    await clerkClient.users.updateUserMetadata(data.clerkId, {
      publicMetadata: {
        role: data.role
      }
    });
    return NextResponse.json({ message: "User created" });
  } catch (error) {
    await clerkClient.users.deleteUser(data.clerkId);
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", stackTrace: error },
      { status: 500 }
    );
  }
};
