"use server";
import prisma from "@/app/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  try {
    const params = await props.params;
    const { postId } = params;
    const body = await req.json();

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: body
    });
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.id}`);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }
  try {
    const params = await props.params;
    const { postId } = params;
    const post = await prisma.blogPost.delete({
      where: { id: postId }
    });
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.id}`);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error deleting post:", error);

    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await props.params;
    const { postId } = params;
    const post = await prisma.blogPost.findUnique({
      where: { id: postId }
    });
    if (!post) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);

    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'article" },
      { status: 500 }
    );
  }
}
