"use server";
import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getMainUserData = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const data = await prisma.user.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      id: true,
      extra: {
        select: {
          id: true
        }
      },
      company: {
        select: {
          id: true
        }
      }
    }
  });
  if (!data?.id) {
    throw new Error("User not found");
  }

  return {
    userId: data.id,
    extraId: data.extra?.id || null,
    companyId: data.company?.id || null
  };
};
