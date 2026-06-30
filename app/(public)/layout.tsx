import { ClerkProvider } from "@clerk/nextjs";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="w-full flex-1">{children}</main>
      </div>
    </ClerkProvider>
  );
}
