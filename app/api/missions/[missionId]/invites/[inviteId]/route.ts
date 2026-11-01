import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { EnumRole } from "@/store/types";
import { handlePrismaError } from "@/utils/prismaErrors.util";

/**
 * Handles PATCH requests to update the status of a mission invite or user mission.
 *
 * This endpoint allows the company that created the mission to cancel an invitation
 * or a user mission based on the `registered` flag in the request body. If `registered`
 * is true, the status of the corresponding `userMission` is set to "cancelled". Otherwise,
 * the status of the `invitation` is set to "cancelled".
 *
 * @param NextRequest - The incoming HTTP request object containing the JSON body.
 * @param props - An object containing route parameters as a Promise, including `missionId` and `inviteId`.
 * @returns {Promise<NextResponse>} A JSON response:
 *   - 200: invite/user mission cancelled.
 *   - 400: missing route parameters.
 *   - 401: not authenticated or not a company.
 *   - 403: the mission belongs to another company.
 *   - 404: mission not found, or invite not found in this mission.
 *   - 500: unexpected error.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ missionId: string; inviteId: string }> }
): Promise<NextResponse> {
  const { userId: clerkId, sessionClaims } = await auth();
  const { missionId, inviteId } = await props.params;

  if (!clerkId || sessionClaims?.publicMetadata?.role !== EnumRole.COMPANY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!missionId || !inviteId) {
    return NextResponse.json(
      { message: "Mission ID and Invite ID are required" },
      { status: 400 }
    );
  }

  try {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        creator: { select: { user: { select: { clerkId: true } } } }
      }
    });

    if (!mission) {
      return NextResponse.json(
        { message: "Mission not found" },
        { status: 404 }
      );
    }

    if (mission.creator.user.clerkId !== clerkId) {
      return NextResponse.json(
        {
          message: "You are not authorized to manage invites for this mission"
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { registered } = body as { registered: boolean };

    // Le filtre sur missionId garantit que l'invitation appartient bien à
    // cette mission : un id d'une autre mission ne met rien à jour (→ 404).
    const where = { id: inviteId, missionId };
    const data = { status: "cancelled" as const };
    const { count } = registered
      ? await prisma.userMission.updateMany({ where, data })
      : await prisma.invitation.updateMany({ where, data });

    if (count === 0) {
      return NextResponse.json(
        { message: "Invite not found for this mission" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { code, message } = handlePrismaError(
      error,
      `PATCH /api/missions/${missionId}/invites/${inviteId}`
    );
    console.error(`Error ${code}: ${message}`);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
