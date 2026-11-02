import { Providers } from "@/components/Providers/Providers";

/**
 * `QueryClientProvider` limité à la vitrine des missions (et non à tout
 * `(public)`) : seuls le listing et la candidature y consomment TanStack
 * Query. Le cache est propre à ce segment, distinct de celui de l'espace
 * connecté.
 */
export default function PublicMissionsLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Providers>{children}</Providers>;
}
