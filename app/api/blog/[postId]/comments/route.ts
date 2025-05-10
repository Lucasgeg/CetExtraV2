import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const comments = await prisma.blogComment.findMany({
    where: { postId: params.postId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(comments);
}
