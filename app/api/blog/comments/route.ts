import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const { postId, author, content } = await req.json();

  if (
    typeof postId !== "string" ||
    typeof author !== "string" ||
    typeof content !== "string" ||
    author.length < 2 ||
    content.length < 2
  ) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const comment = await prisma.blogComment.create({
    data: { postId, author, content }
  });
  revalidatePath(`/blog/${postId}`);

  return NextResponse.json({ success: true, comment });
}
