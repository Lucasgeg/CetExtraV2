"use client";

import { ArrowLeft, Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader/Loader";
import { RefreshErrorBanner } from "@/components/ui/RefreshErrorBanner/RefreshErrorBanner";
import { useMyEngagements } from "@/hooks/useMyEngagements";
import type { MeEngagement } from "@/types/MeEngagements";
import {
  type EngagementSection,
  groupEngagements
} from "@/utils/myEngagements.util";
import { EngagementCard } from "./EngagementCard";

const SECTIONS: {
  id: EngagementSection;
  title: string;
  description: string;
  empty: string;
}[] = [
  {
    id: "invitations",
    title: "Invitations reçues",
    description: "Des employeurs vous proposent ces missions.",
    empty: "Aucune invitation en attente pour le moment."
  },
  {
    id: "applications",
    title: "Candidatures en cours",
    description: "L’employeur n’a pas encore répondu à ces candidatures.",
    empty: "Aucune candidature en attente de réponse."
  },
  {
    id: "upcoming",
    title: "Missions à venir",
    description: "Missions confirmées par l’employeur.",
    empty: "Aucune mission confirmée à venir."
  },
  {
    id: "history",
    title: "Historique",
    description:
      "Missions terminées, candidatures non retenues, invitations expirées et annulations.",
    empty: "Rien dans votre historique pour l’instant."
  }
];

const EngagementSectionBlock = ({
  section,
  engagements,
  now
}: {
  section: (typeof SECTIONS)[number];
  engagements: MeEngagement[];
  now: Date;
}) => {
  const headingId = `engagements-${section.id}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-2xl bg-extra-background/95 p-4 shadow-md sm:p-5"
    >
      <header>
        <h2
          id={headingId}
          className="flex items-center gap-2 font-bold text-extra-text-primary text-lg"
        >
          {section.title}
          <span className="rounded-full bg-extra-primary px-2 py-0.5 font-semibold text-extra-text-primary text-xs tabular-nums">
            {engagements.length}
          </span>
        </h2>
        <p className="text-extra-text-secondary text-sm">
          {section.description}
        </p>
      </header>

      {engagements.length === 0 ? (
        <p className="text-extra-text-secondary text-sm italic">
          {section.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {engagements.map((engagement) => (
            <li key={engagement.id}>
              {/* Invitations en lecture seule pour l'instant : accepter ou
                  refuser arrivera via la prop `actions` de la carte, en
                  s'appuyant sur utils/engagement.util.ts */}
              <EngagementCard engagement={engagement} now={now} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const MyEngagements = () => {
  const { data, isPending, isError, isFetching, refetch, dataUpdatedAt } =
    useMyEngagements();

  // Référence temporelle = instant de la dernière réponse : stable entre deux
  // rendus, mise à jour à chaque revalidation
  const now = useMemo(
    () => new Date(dataUpdatedAt || Date.now()),
    [dataUpdatedAt]
  );
  const engagements = data?.engagements;
  const grouped = useMemo(
    () => groupEngagements(engagements ?? [], now),
    [engagements, now]
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-2 sm:p-4">
      <div className="flex flex-col gap-2">
        <Link
          href="/extra"
          className="flex w-fit items-center gap-1 text-sm text-white-soft/80 underline-offset-4 hover:text-white-soft hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l’accueil
        </Link>
        <h1 className="font-bold text-2xl text-white-soft sm:text-3xl">
          Mes candidatures
        </h1>
        <p className="text-white-soft/80">
          Retrouvez vos invitations, vos candidatures et vos missions.
        </p>
      </div>

      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <Loader
            size="lg"
            text="Chargement de vos candidatures"
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
            Impossible de charger vos candidatures pour le moment. Vérifiez
            votre connexion puis réessayez.
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

          {!engagements || engagements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-extra-background/95 px-5 py-12 text-center shadow-md">
              <Inbox
                size={32}
                aria-hidden="true"
                className="text-extra-text-secondary"
              />
              <h2 className="font-bold text-extra-text-primary text-lg">
                Aucune candidature pour le moment
              </h2>
              <p className="max-w-md text-extra-text-secondary">
                Les invitations que vous envoient les employeurs et les
                candidatures que vous déposez sur des missions apparaîtront ici,
                avec leur statut.
              </p>
              <Button asChild theme="extra" rounded="lg">
                <Link href="/missions">Voir les missions disponibles</Link>
              </Button>
            </div>
          ) : (
            SECTIONS.map((section) => (
              <EngagementSectionBlock
                key={section.id}
                section={section}
                engagements={grouped[section.id]}
                now={now}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};
