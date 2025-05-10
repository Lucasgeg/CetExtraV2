import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;
  const comments = await prisma.blogComment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(comments);
}
