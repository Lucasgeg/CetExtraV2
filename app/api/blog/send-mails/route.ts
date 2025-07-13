import prisma from "@/app/lib/prisma";
import { NewBlogPostTemplate } from "@/components/MailTemplate/NewBlogPostTemplate";
import { auth } from "@clerk/nextjs/server";
import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendMailResponse = {
  title: string;
  shortDesc: string;
  postId: string;
  emailSubject: string;
  shortUrl: string;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_USER_ID) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }
  const { shortDesc, title, emailSubject, shortUrl } =
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
    const NewBlogPostEmail = NewBlogPostTemplate({
      title,
      shortDesc,
      url: `${baseUrl}/blog/${shortUrl}`
    });

    const results = await resend.emails.send({
      from: "Cet Extra <no-reply@cetextra.fr>",
      to: ["admin@cetextra.fr"],
      bcc: subscriberEmails,
      subject: emailSubject,
      react: NewBlogPostEmail,
      text: await render(NewBlogPostEmail),
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
