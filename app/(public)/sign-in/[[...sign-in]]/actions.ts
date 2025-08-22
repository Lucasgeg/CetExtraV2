"use server";
import prisma from "@/app/lib/prisma";
import { decrypt } from "@/utils/crypto";
import { getKey } from "@/utils/keyCache";
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
  const key = await getKey();
  let userFirstName;
  if (data.extra?.first_name) {
    userFirstName = decrypt(data.extra.first_name, key);
  } else if (data.company?.contactFirstName) {
    userFirstName = decrypt(data.company.contactFirstName, key);
  }

  return {
    userId: data.id,
    extraId: data.extra?.id || null,
    companyId: data.company?.id || null,
    userFirstName
  };
};
