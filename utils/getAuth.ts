import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const getAuth = async (userId: string) => {
  const { userId: clerkId } = await auth();

  if (!clerkId || clerkId !== userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
};
