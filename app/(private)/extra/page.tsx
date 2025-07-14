"use server";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.publicMetadata.role) {
    return <div>Vous n'avez pas accès à cette page</div>;
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 overflow-auto p-4 lg:grid lg:grid-cols-6 lg:grid-rows-2 lg:gap-4">
      <span>Bienvenue!</span>
    </div>
  );
}
