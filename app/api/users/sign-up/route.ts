"use server";
import prisma from "@/app/lib/prisma";
import { Role, UserSignUpSchema } from "@/store/types";
import { createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  const data: UserSignUpSchema = await req.json();
  if (data.role === Role.EXTRA) {
    try {
      await createExtra(data);
    } catch (error) {
      return NextResponse.json(
        { message: "Error creating user: ", stackTrace: error },
        { status: 500 }
      );
    }
  }
}

const createExtra = async (data: UserSignUpSchema) => {
  if (!data.extra) {
    return;
  }
  if (!data.extra.birthdate) {
    return;
  }

  try {
    await prisma.user.create({
      data: {
        email: data.email,
        role: data.role,
        clerkId: data.clerkId,
        extra: {
          create: {
            first_name: data.extra.first_name,
            last_name: data.extra.last_name,
            birthdate: data.extra.birthdate,
            missionJob: data.extra.missionJob,
            max_travel_distance: data.extra.max_travel_distance,
            phone: data.extra.phone,
          },
        },
        userLocation: {
          create: {
            fullName: data.location.fullName,
            lat: data.location.lat,
            lon: data.location.lon,
          },
        },
      },
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
