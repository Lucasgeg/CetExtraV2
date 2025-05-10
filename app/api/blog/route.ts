import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type BlogPostApiRequest = {
  title: string;
  content: string;
  keywords: string[];
  shortDesc: string;
};

export async function POST(req: Request) {
  try {
    const body: BlogPostApiRequest = await req.json();
    const post = await prisma.blogPost.create({ data: body });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.id}`);

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}
