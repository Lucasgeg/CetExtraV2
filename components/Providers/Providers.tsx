"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";
import { makeQueryClient } from "@/utils/queryClient";

/**
 * Providers client de l'espace connecté. Le `QueryClient` est créé une fois
 * par montage via `useState` : jamais de client global au module, qui serait
 * partagé entre les requêtes (et donc les utilisateurs) côté serveur.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* No-op hors `NODE_ENV === "development"` (géré par le package) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
