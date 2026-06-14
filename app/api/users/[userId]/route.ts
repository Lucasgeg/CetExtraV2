import prisma from "@/app/lib/prisma";
import { PrismaMissionJob } from "@/store/types";
import { GetUserByIdResponse } from "@/types/GetUserByIdResponse";
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

    const response: GetUserByIdResponse = {
      id: userId,
      description: user?.description || undefined,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl
        ? user.profilePictureUrl
        : undefined,
      extra: user.extra
        ? {
            birthdateIso: user.extra.birthdateIso,
            firstName: user.extra.first_name,
            lastName: user.extra.last_name,
            missionJobs: user.extra.missionJobs.map((job) => ({
              missionJob: job.missionJob as PrismaMissionJob,
              experience: job.experience
            })),
            phone: user.extra.phone || undefined
          }
        : undefined,
      company: user.company
        ? {
            userId: user.company.userId,
            id: user.company.id,
            companyName: user.company.company_name,
            companyPhone: user.company.company_phone
              ? user.company.company_phone
              : undefined,
            contactFirstName: user.company.contactFirstName,
            contactLastName: user.company.contactLastName,
            logoId: user.company.logoId ? user.company.logoId : undefined
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
