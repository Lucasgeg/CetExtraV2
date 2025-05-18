import NewsletterForm from "@/components/NewsLetterForm/NewsLetterForm";

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {children}
      {process.env.VERCEL_ENV === "production" && <NewsletterForm />}
    </div>
  );
}
