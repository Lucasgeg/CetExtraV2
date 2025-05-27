import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div
        className={`${geistSans.variable} ${geistMono.variable} mx-auto flex h-screen w-full flex-col px-6 antialiased`}
      >
        <div className="relative flex items-center">
          <CetExtraLogo className="h-16 w-16 lg:invisible" />
          <span className="absolute left-1/2 -translate-x-1/2 transform text-2xl lg:text-6xl">
            Bienvenue John Doe
          </span>
          <div className="ml-auto flex gap-1">
            <div className="h-7 w-7 rounded-full">
              <Cog6ToothIcon className="h-full w-full" />
            </div>
            <div className="h-7 w-7">
              <UserButton />
            </div>
          </div>
        </div>
        <div className="my-auto flex flex-1 flex-col bg-main-gradient p-6 lg:max-h-[80vh]">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-1000"></div>
          <div className="absolute right-1/3 top-1/2 h-64 w-64 animate-pulse rounded-full bg-cyan-500/10 blur-3xl delay-500"></div>

          {children}
        </div>
      </div>
    </ClerkProvider>
  );
}
