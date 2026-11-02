"use client";

import {
  ArrowRight,
  CalendarDays,
  Hourglass,
  type LucideIcon,
  Mail
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EngagementCard } from "@/components/MyEngagements/EngagementCard";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader/Loader";
import { RefreshErrorBanner } from "@/components/ui/RefreshErrorBanner/RefreshErrorBanner";
import { useMyEngagements } from "@/hooks/useMyEngagements";
import { groupEngagements } from "@/utils/myEngagements.util";

const UPCOMING_PREVIEW_COUNT = 3;

const SummaryTile = ({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) => (
  <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center gap-x-4 rounded-2xl border border-extra-border bg-extra-background p-4 shadow-sm">
    <div className="row-span-2 flex h-11 w-11 items-center justify-center rounded-xl bg-extra-surface text-extra-secondary">
      <Icon size={24} aria-hidden="true" />
    </div>
    <dt className="font-semibold text-extra-text-secondary text-xs uppercase tracking-[0.12em]">
      {label}
    </dt>
    <dd className="font-bold text-2xl text-extra-text-primary tabular-nums">
      {value}
    </dd>
  </div>
);

/**
 * Accueil extra : prochaines missions confirmées, compteurs d'invitations et
 * de candidatures en attente, lien vers « Mes candidatures ». Partage le
 * cache de la page complète (même clé de requête, sans filtre).
 */
export const ExtraHome = () => {
  const { data, isPending, isError, isFetching, refetch, dataUpdatedAt } =
    useMyEngagements();

  const now = useMemo(
    () => new Date(dataUpdatedAt || Date.now()),
    [dataUpdatedAt]
  );
  const engagements = data?.engagements;
  const grouped = useMemo(
    () => groupEngagements(engagements ?? [], now),
    [engagements, now]
  );
  const upcomingPreview = grouped.upcoming.slice(0, UPCOMING_PREVIEW_COUNT);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-2 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-white-soft sm:text-3xl">
            Bienvenue !
          </h1>
          <p className="mt-1 text-white-soft/80">
            Suivez vos invitations, vos candidatures et vos prochaines missions.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            theme="extra"
            variant="outline"
            size="lg"
            rounded="lg"
          >
            <Link href="/missions">Voir les missions disponibles</Link>
          </Button>
          <Button
            asChild
            theme="extra"
            size="lg"
            rounded="lg"
            className="[&_svg]:size-5"
          >
            <Link href="/extra/candidatures">
              Mes candidatures
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="flex h-48 items-center justify-center">
          <Loader
            size="lg"
            text="Chargement de votre espace"
            variant="dots"
            textClassName="text-white-soft"
          />
        </div>
      ) : isError && !data ? (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm"
        >
          <p>
            Impossible de charger vos missions et candidatures pour le moment.
          </p>
          <Button
            type="button"
            theme="extra"
            rounded="lg"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Nouvelle tentative…" : "Réessayer"}
          </Button>
        </div>
      ) : (
        <>
          {isError && (
            <RefreshErrorBanner
              onRetry={() => refetch()}
              retrying={isFetching}
            />
          )}

          <section aria-labelledby="extra-home-summary">
            <h2 id="extra-home-summary" className="sr-only">
              En résumé
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryTile
                icon={Mail}
                label="Invitations reçues"
                value={grouped.invitations.length}
              />
              <SummaryTile
                icon={Hourglass}
                label="Candidatures en attente de réponse"
                value={grouped.applications.length}
              />
            </dl>
          </section>

          <section
            aria-labelledby="extra-home-upcoming"
            className="flex flex-col gap-3 rounded-2xl bg-extra-background/95 p-4 shadow-md sm:p-5"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="extra-home-upcoming"
                className="flex items-center gap-2 font-bold text-extra-text-primary text-lg"
              >
                <CalendarDays size={20} aria-hidden="true" />
                Prochaines missions
              </h2>
              <Link
                href="/extra/candidatures"
                className="flex items-center gap-1 font-semibold text-extra-secondary text-sm underline-offset-4 hover:underline"
              >
                Voir toutes mes candidatures
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </header>

            {upcomingPreview.length === 0 ? (
              <p className="text-extra-text-secondary text-sm italic">
                Aucune mission confirmée à venir pour le moment.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {upcomingPreview.map((engagement) => (
                  <li key={engagement.id}>
                    <EngagementCard engagement={engagement} now={now} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};
