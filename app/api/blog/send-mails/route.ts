import prisma from "@/app/lib/prisma";
import { NewBlogPostTemplate } from "@/utils/NewBlogPostTemplate";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendMailResponse = {
  title: string;
  shortDesc: string;
  postId: string;
  emailSubject: string;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }
  const { postId, shortDesc, title, emailSubject } =
    (await request.json()) as SendMailResponse;

  const baseUrl = "https://cetextra.fr";
  const unsubscribePath = "/blog/unsubscribe";

  try {
    const subscribersList = await prisma.blogSubscriber.findMany({
      select: { email: true },
      where: { subscribed: true }
    });

    const subscriberEmails = subscribersList.map(
      (subscriber) => subscriber.email
    );

    const results = await resend.emails.send({
      from: "Cet Extra <no-reply@cetextra.fr>",
      to: ["admin@cetextra.fr"],
      bcc: subscriberEmails,
      subject: emailSubject,
      react: NewBlogPostTemplate({
        title,
        shortDesc,
        url: `${baseUrl}/blog/${postId}`
      }),
      headers: {
        "List-Unsubscribe": `<${baseUrl}${unsubscribePath}>`
      }
    });

    return Response.json({ data: results });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails :", error);
    return Response.json({ error }, { status: 500 });
  }
}
