import { cn } from "@/lib/utils";

type RefreshErrorBannerProps = {
  /** Relance la requête (ex. `refetch` de TanStack Query). */
  onRetry: () => void;
  /** Désactive le bouton pendant la nouvelle tentative. */
  retrying?: boolean;
  className?: string;
};

/**
 * Bannière non bloquante pour un rafraîchissement en échec alors que des
 * données (plus anciennes) restent affichées : on ne remplace pas l'écran.
 */
export function RefreshErrorBanner({
  onRetry,
  retrying = false,
  className
}: RefreshErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm",
        className
      )}
    >
      <span>Impossible de rafraîchir les données.</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="shrink-0 font-semibold underline disabled:opacity-50"
      >
        {retrying ? "Nouvelle tentative…" : "Réessayer"}
      </button>
    </div>
  );
}
