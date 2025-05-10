"use server";
import { CompanyHome } from "@/components/home/CompanyHome/CompanyHome";
import { EnumRole } from "@/store/types";
import { auth } from "@clerk/nextjs/server";

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
    <div className="grid h-screen w-full gap-4 p-4">
      <div className="grid gap-2 lg:grid-cols-6 lg:grid-rows-2 lg:gap-4">
        <HomeComponent />
      </div>
    </div>
  );
}
