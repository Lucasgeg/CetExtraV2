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
 * the status of the `invitation` is set to "cancelled". Only pending invites can be cancelled.
 *
 * @param NextRequest - The incoming HTTP request object containing the JSON body
 *   `{ registered: boolean }`.
 * @param props - An object containing route parameters as a Promise, including `missionId` and `inviteId`.
 * @returns {Promise<NextResponse>} A JSON response:
 *   - 200: invite/user mission cancelled.
 *   - 400: missing route parameters, invalid JSON, or `registered` not a boolean.
 *   - 401: not authenticated or not a company.
 *   - 403: the mission belongs to another company.
 *   - 404: mission not found, or no pending invite with this ID in this mission.
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  const registered =
    typeof body === "object" && body !== null && "registered" in body
      ? body.registered
      : undefined;

  // Un vrai booléen est exigé : la chaîne "false" serait truthy et viserait
  // la mauvaise table.
  if (typeof registered !== "boolean") {
    return NextResponse.json(
      { message: "`registered` must be a boolean" },
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

    // Le filtre sur missionId garantit que l'invitation appartient bien à
    // cette mission : un id d'une autre mission ne met rien à jour (→ 404).
    // Le filtre pending limite la route aux invitations en attente : pas
    // d'annulation d'un extra accepté ni d'une candidature `requested`.
    const where = { id: inviteId, missionId, status: "pending" as const };
    const data = { status: "cancelled" as const };
    const { count } = registered
      ? await prisma.userMission.updateMany({ where, data })
      : await prisma.invitation.updateMany({ where, data });

    if (count === 0) {
      return NextResponse.json(
        { message: "Pending invite not found for this mission" },
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
