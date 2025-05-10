import NewsletterForm from "@/components/NewsLetterForm/NewsLetterForm";
import { ClerkProvider } from "@clerk/nextjs";

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {children}
      <NewsletterForm />
    </ClerkProvider>
  );
}
