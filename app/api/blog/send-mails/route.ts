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
  const unsubscribePath = "/unsubscribe";

  try {
    const subscribers = await prisma.blogSubscriber.findMany({
      select: { email: true, id: true }
    });

    // Envoi individualisé pour chaque subscriber
    const results = await Promise.all(
      subscribers.map(async (subscriber) => {
        const unsubscribeUrl = `${baseUrl}${unsubscribePath}?id=${subscriber.id}`;

        return resend.emails.send({
          from: "Cet Extra <no-reply@cetextra.fr>",
          to: [subscriber.email],
          subject: emailSubject,
          react: NewBlogPostTemplate({
            title,
            shortDesc,
            url: `${baseUrl}/blog/${postId}`,
            unsubscribeUrl
          }),
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
          }
        });
      })
    );

    return Response.json({ data: results });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
