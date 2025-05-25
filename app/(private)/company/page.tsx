"use server";
import { CompanyHome } from "@/components/home/CompanyHome/CompanyHome";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.publicMetadata.role) {
    return <div>Vous n'avez pas accès à cette page</div>;
  }

  return (
    <div className="grid w-full gap-4 p-4">
      <div className="grid gap-2 lg:grid-cols-6 lg:grid-rows-2 lg:gap-4">
        <CompanyHome />
      </div>
    </div>
  );
}
