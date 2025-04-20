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
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-6 w-full">
      {/* Header */}
      <div className="flex items-center relative col-span-6">
        <CetExtraLogo className="w-16 h-16" />
        <span className="absolute left-1/2 transform -translate-x-1/2">
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
      <HomeComponent />
    </div>
  );
}
