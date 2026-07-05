"use server";
import { auth } from "@clerk/nextjs/server";
import { CompanyHome } from "@/components/home/CompanyHome/CompanyHome";

export default async function Home() {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.publicMetadata.role) {
    return <div>Vous n'avez pas accès à cette page</div>;
  }

  return <CompanyHome />;
}
