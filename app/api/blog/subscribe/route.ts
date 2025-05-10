import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    const existingSubscriber = await prisma.blogSubscriber.findUnique({
      where: { email }
    });

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { message: "Vous êtes déjà inscrit à notre newsletter !" },
          { status: 409 }
        );
      } else {
        // Réactivation de l'abonnement
        await prisma.blogSubscriber.update({
          where: { email },
          data: { subscribed: true }
        });
        return NextResponse.json({
          message: "Bienvenue de nouveau ! Votre réinscription est confirmée."
        });
      }
    }

    // Nouvel abonnement
    await prisma.blogSubscriber.create({
      data: { email, subscribed: true }
    });

    return NextResponse.json({
      message: "Merci pour votre inscription à notre newsletter !"
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
