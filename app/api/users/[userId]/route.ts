import prisma from "@/app/lib/prisma";
import { GetUserByIdResponse } from "@/types/GetUserByIdResponse";
import { decrypt } from "@/utils/crypto";
import { getKey } from "@/utils/keyCache";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  const { userId: currentUserId, sessionClaims } = await auth();

  if (!currentUserId || sessionClaims.publicMetadata.role !== "company") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { userId } = await props.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        company: true,
        extra: {
          select: {
            birthdateIso: true,
            first_name: true,
            last_name: true,
            missionJobs: {
              select: {
                missionJob: true,
                experience: true
              }
            },
            phone: true
          }
        },
        description: true,
        profilePictureUrl: true,
        email: true
      }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const key = await getKey();

    const response: GetUserByIdResponse = {
      id: userId,
      description: user?.description
        ? decrypt(user.description, key)
        : undefined,
      email: decrypt(user.email, key),
      profilePictureUrl: user.profilePictureUrl
        ? decrypt(user.profilePictureUrl, key)
        : undefined,
      extra: user.extra
        ? {
            birthdateIso: decrypt(user.extra.birthdateIso, key),
            firstName: decrypt(user.extra.first_name, key),
            lastName: decrypt(user.extra.last_name, key),
            missionJobs: user.extra.missionJobs.map((job) => ({
              missionJob: String(job.missionJob),
              experience: String(job.experience)
            })),
            phone: user.extra.phone ? decrypt(user.extra.phone, key) : undefined
          }
        : undefined,
      company: user.company
        ? {
            userId: user.company.userId,
            id: user.company.id,
            companyName: decrypt(user.company.company_name, key),
            companyPhone: user.company.company_phone
              ? decrypt(user.company.company_phone, key)
              : undefined,
            contactFirstName: decrypt(user.company.contactFirstName, key),
            contactLastName: decrypt(user.company.contactLastName, key),
            logoId: user.company.logoId
              ? decrypt(user.company.logoId, key)
              : undefined
          }
        : undefined
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
