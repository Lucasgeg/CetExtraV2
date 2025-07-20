import prisma from "@/app/lib/prisma";
import { EnumRole } from "@/store/types";
import { ApiError } from "@/types/ApiError";
import { handlePrismaError } from "@/utils/prismaErrors.util";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles PATCH requests to update the status of a mission invite or user mission.
 *
 * This endpoint allows a company user to cancel an invitation or a user mission
 * based on the `registered` flag in the request body. If `registered` is true,
 * the status of the corresponding `userMission` is set to "cancelled". Otherwise,
 * the status of the `invitation` is set to "cancelled".
 *
 * @param NextRequest - The incoming HTTP request object containing the JSON body.
 * @param props - An object containing route parameters as a Promise, including `missionId` and `inviteId`.
 * @returns {Promise<NextResponse>} A JSON response indicating success, or throws an `ApiError` on failure.
 *
 * @throws {ApiError} If the user is unauthorized, required parameters are missing, or an internal error occurs.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ missionId: string; inviteId: string }> }
): Promise<NextResponse> {
  const { userId: clerkId, sessionClaims } = await auth();
  const { missionId, inviteId } = await props.params;

  if (!clerkId || sessionClaims.publicMetadata.role !== EnumRole.COMPANY) {
    throw new ApiError("Unauthorized", 401);
  }

  if (!missionId || !inviteId) {
    throw new ApiError("Mission ID and Invite ID are required", 400);
  }

  try {
    const body = await request.json();
    const { registered } = body as { registered: boolean };

    if (registered) {
      await prisma.userMission.update({
        where: {
          id: inviteId,
          missionId: missionId
        },
        data: {
          status: "cancelled"
        }
      });

      return NextResponse.json({ success: true });
    } else {
      await prisma.invitation.update({
        where: {
          id: inviteId,
          missionId: missionId
        },
        data: {
          status: "cancelled"
        }
      });

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    const { code, message } = handlePrismaError(
      error,
      `PATCH /api/missions/${missionId}/invites/${inviteId}`
    );
    console.error(`Error ${code}: ${message}`);
    throw new ApiError("Internal Server Error", 500);
  }
}
