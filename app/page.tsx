"use server";
import { CompanyHome } from "@/components/home/CompanyHome/CompanyHome";
import { CetExtraLogo } from "@/components/icons/CetExtraLogo";
import { EnumRole } from "@/store/types";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default async function Home() {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.publicMetadata.role) {
    return <div>Vous n'avez pas accès à cette page</div>;
  }
  const HomeComponent = () => {
    switch (sessionClaims?.publicMetadata.role) {
      case EnumRole.COMPANY:
        return <CompanyHome />;

      case EnumRole.EXTRA:
        return <div>Extra Home</div>;
      default:
        throw new Error("Invalid role");
    }
  };

  return (
    <div className="grid grid-rows-[0.25fr_1fr] gap-4 p-4 w-full h-screen">
      {/* Header */}
      <div className="flex items-center relative">
        <CetExtraLogo className="w-16 h-16 lg:invisible" />
        <span className="absolute left-1/2 transform -translate-x-1/2 lg:text-6xl">
          Bienvenue John Doe
        </span>
        <div className="flex ml-auto gap-1">
          <div className="rounded-full w-7 h-7">
            <Cog6ToothIcon className="w-full h-full" />
          </div>
          <div className="w-7 h-7">
            <UserButton />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4 grid-rows-2">
        <HomeComponent />
      </div>
    </div>
  );
}
