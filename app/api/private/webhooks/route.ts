import prisma from "@/app/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

type WebhookPayload = Omit<WebhookEvent, "data"> & {
  data: WebhookEvent["data"] & {
    image_url?: string;
  };
};

async function validateRequest(request: Request) {
  if (!process.env.SVIX_SECRET_WEBHOOKS) {
    throw new Error("missing environment variable");
  }
  const webhookSecret = process.env.SVIX_SECRET_WEBHOOKS;
  const payloadString = await request.text();
  const headerPayload = await headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!
  };
  if (
    !svixHeaders["svix-id"] ||
    !svixHeaders["svix-timestamp"] ||
    !svixHeaders["svix-signature"]
  ) {
    throw new Error("Missing required headers");
  }
  const wh = new Webhook(webhookSecret);
  return wh.verify(payloadString, svixHeaders) as WebhookEvent;
}

export async function POST(request: Request) {
  const payload: WebhookPayload = await validateRequest(request);
  if (payload.type !== "user.updated") {
    return new Response("Event type not supported", { status: 400 });
  }
  if (!payload.data.image_url) {
    return NextResponse.json({
      message: "No image URL provided",
      status: 200
    });
  }

  try {
    await prisma.user.update({
      where: { clerkId: payload.data.id },
      data: {
        profilePictureUrl: payload.data.image_url || null,
        updated_at: new Date()
      }
    });
    return NextResponse.json(
      { message: "User profile picture updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile picture:", error);
    return NextResponse.json(
      { error: "Failed to update user profile picture" },
      { status: 500 }
    );
  }
}
