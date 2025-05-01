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
    <div className="grid h-screen w-full grid-rows-[0.25fr_1fr] gap-4 p-4">
      {/* Header */}
      <div className="relative flex items-center">
        <CetExtraLogo className="h-16 w-16 lg:invisible" />
        <span className="absolute left-1/2 -translate-x-1/2 transform lg:text-6xl">
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
      <div className="grid grid-cols-6 grid-rows-2 gap-4">
        <HomeComponent />
      </div>
    </div>
  );
}
