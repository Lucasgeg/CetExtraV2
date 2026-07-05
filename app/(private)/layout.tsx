import { ClerkProvider } from "@clerk/nextjs";

export default function PrivateLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
