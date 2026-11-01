import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers/Providers";

export default function PrivateLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // `Providers` (TanStack Query) volontairement ici et non dans le layout
  // racine : tous ses consommateurs sont dans l'espace connecté, et quitter
  // ce groupe (déconnexion → pages publiques) démonte le cache, ce qui évite
  // d'afficher les données d'un compte à un autre dans le même onglet
  return (
    <ClerkProvider>
      <Providers>{children}</Providers>
    </ClerkProvider>
  );
}
