"use server";
import { auth } from "@clerk/nextjs/server";
import { ExtraHome } from "@/components/home/ExtraHome/ExtraHome";

export default async function Home() {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.publicMetadata.role) {
    return <div>Vous n'avez pas accès à cette page</div>;
  }

  return <ExtraHome />;
}
