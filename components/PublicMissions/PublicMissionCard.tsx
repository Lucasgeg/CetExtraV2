import {
  Building2,
  CalendarDays,
  Euro,
  MapPin,
  Navigation
} from "lucide-react";
import Link from "next/link";
import type { PublicMissionListItem } from "@/types/PublicMissions";
import {
  formatDistanceKm,
  formatHourlyRateRange,
  formatMissionPeriod,
  publicJobLabel,
  remainingPlacesLabel
} from "@/utils/publicMission.format";

type PublicMissionCardProps = {
  mission: PublicMissionListItem;
};

/**
 * Carte d'une mission du listing public. Le titre est un `<h3>` : la page
 * porte le `<h1>` et la section des résultats un `<h2>`.
 */
export function PublicMissionCard({ mission }: PublicMissionCardProps) {
  const rateRange = formatHourlyRateRange(
    mission.hourlyRateMin,
    mission.hourlyRateMax
  );

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-xl border border-employer-border bg-white p-5 shadow-xs transition-shadow focus-within:ring-2 focus-within:ring-employer-secondary hover:shadow-md">
      <h3 className="font-bold text-employer-primary text-lg leading-snug">
        {/* Lien étiré sur toute la carte (pseudo-élément) */}
        <Link
          href={`/missions/${mission.id}`}
          className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-hidden"
        >
          {mission.name}
        </Link>
      </h3>

      <dl className="flex flex-col gap-2 text-employer-text-primary text-sm">
        <div className="flex items-start gap-2">
          <dt className="sr-only">Entreprise</dt>
          <Building2
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-employer-text-secondary"
          />
          <dd className="font-semibold">{mission.creator.company_name}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="sr-only">Adresse</dt>
          <MapPin
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-employer-text-secondary"
          />
          <dd>{mission.missionLocation.fullName}</dd>
        </div>
        {mission.distance !== null && (
          <div className="flex items-start gap-2">
            <dt className="sr-only">Distance</dt>
            <Navigation
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-employer-text-secondary"
            />
            <dd>à {formatDistanceKm(mission.distance)}</dd>
          </div>
        )}
        <div className="flex items-start gap-2">
          <dt className="sr-only">Dates (heure de Paris)</dt>
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-employer-text-secondary"
          />
          <dd>
            <time dateTime={mission.missionStartDate}>
              {formatMissionPeriod(
                mission.missionStartDate,
                mission.missionEndDate
              )}
            </time>
          </dd>
        </div>
        {rateRange && (
          <div className="flex items-start gap-2">
            <dt className="sr-only">Taux horaire indicatif</dt>
            <Euro
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-employer-text-secondary"
            />
            <dd>{rateRange}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto">
        <p className="mb-2 font-semibold text-employer-text-secondary text-xs uppercase tracking-[0.1em]">
          Postes à pourvoir
        </p>
        <ul className="flex flex-wrap gap-2">
          {mission.requiredPositions.map((position) => (
            <li
              key={position.jobType}
              className="rounded-full bg-employer-surface px-3 py-1 font-medium text-employer-primary text-xs"
            >
              {publicJobLabel(position.jobType)} ·{" "}
              {remainingPlacesLabel(position.remaining)}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
