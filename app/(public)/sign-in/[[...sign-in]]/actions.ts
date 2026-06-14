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
          id: true,
          first_name: true
        }
      },
      company: {
        select: {
          id: true,
          contactFirstName: true
        }
      }
    }
  });
  if (!data?.id) {
    throw new Error("User not found");
  }
  let userFirstName;
  if (data.extra?.first_name) {
    userFirstName = data.extra.first_name;
  } else if (data.company?.contactFirstName) {
    userFirstName = data.company.contactFirstName;
  }

  return {
    userId: data.id,
    extraId: data.extra?.id || null,
    companyId: data.company?.id || null,
    userFirstName
  };
};
