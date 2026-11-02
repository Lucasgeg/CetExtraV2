import { Building2, CalendarDays, Euro, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApplyToMission } from "@/components/PublicMissions/ApplyToMission";
import {
  buildMissionDescription,
  buildMissionJobPosting,
  serializeJsonLd
} from "@/utils/missionJobPosting";
import {
  formatHourlyRateRange,
  formatMissionPeriod,
  publicJobLabel,
  remainingPlacesLabel
} from "@/utils/publicMission.format";
import { getPublicMission } from "@/utils/publicMissions.server";

type PublicMissionPageParams = {
  missionId: string;
};

// Dédoublonne la requête entre generateMetadata et la page (même rendu)
const getMission = cache(getPublicMission);

const META_DESCRIPTION_MAX_LENGTH = 160;

const truncate = (text: string, maxLength: number) => {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
};

export async function generateMetadata(props: {
  params: Promise<PublicMissionPageParams>;
}): Promise<Metadata> {
  const { missionId } = await props.params;
  const mission = await getMission(missionId);
  if (!mission) return {};

  const title = `${mission.name} – ${mission.creator.company_name}`;
  const description = truncate(
    buildMissionDescription(mission),
    META_DESCRIPTION_MAX_LENGTH
  );
  // URL relatives : résolues par le `metadataBase` du layout racine
  const path = `/missions/${mission.id}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Cet Extra`,
      description,
      url: path,
      type: "website",
      images: [
        {
          url: "/cetextralogo.jpeg",
          width: 1200,
          height: 630,
          alt: "Cet Extra - Plateforme d'extras pour l'évènementiel"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Cet Extra`,
      description,
      images: ["/cetextralogo.jpeg"]
    },
    alternates: {
      canonical: path
    }
  };
}

export default async function PublicMissionPage(props: {
  params: Promise<PublicMissionPageParams>;
}) {
  const { missionId } = await props.params;
  const mission = await getMission(missionId);

  // Même réponse pour une mission inconnue ou non visible publiquement
  if (!mission) notFound();

  const rateRange = formatHourlyRateRange(
    mission.hourlyRateMin,
    mission.hourlyRateMax
  );
  const positions = mission.requiredPositions.map(({ jobType, remaining }) => ({
    jobType,
    label: publicJobLabel(jobType),
    remaining
  }));

  return (
    <div className="bg-white px-4 py-12 sm:px-6 md:py-16">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD sérialisé et échappé par serializeJsonLd (pas d'injection </script>)
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildMissionJobPosting(mission))
        }}
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/missions"
          className="inline-flex items-center gap-1 rounded font-semibold text-employer-text-secondary text-sm transition-colors hover:text-employer-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-employer-secondary"
        >
          ← Toutes les missions
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="font-black text-4xl text-employer-primary tracking-[-0.02em] md:text-5xl">
            {mission.name}
          </h1>
          <p className="mt-3 flex items-center gap-2 font-semibold text-employer-text-primary text-lg">
            <Building2
              aria-hidden="true"
              className="h-5 w-5 text-employer-text-secondary"
            />
            {mission.creator.company_name}
          </p>
        </header>

        <section
          aria-labelledby="mission-practical-heading"
          className="rounded-xl border border-employer-border bg-employer-background p-6"
        >
          <h2
            id="mission-practical-heading"
            className="mb-4 font-bold text-employer-primary text-xl"
          >
            Informations pratiques
          </h2>
          <dl className="grid gap-4 text-employer-text-primary sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="flex items-center gap-2 font-semibold">
              <MapPin
                aria-hidden="true"
                className="h-4 w-4 text-employer-text-secondary"
              />
              Adresse
            </dt>
            <dd>{mission.missionLocation?.fullName ?? "Lieu non précisé"}</dd>

            <dt className="flex items-center gap-2 font-semibold">
              <CalendarDays
                aria-hidden="true"
                className="h-4 w-4 text-employer-text-secondary"
              />
              Dates
            </dt>
            <dd>
              <time dateTime={mission.missionStartDate.toISOString()}>
                {formatMissionPeriod(
                  mission.missionStartDate,
                  mission.missionEndDate
                )}
              </time>{" "}
              <span className="text-employer-text-secondary text-sm">
                (heure de Paris)
              </span>
            </dd>

            {rateRange && (
              <>
                <dt className="flex items-center gap-2 font-semibold">
                  <Euro
                    aria-hidden="true"
                    className="h-4 w-4 text-employer-text-secondary"
                  />
                  Taux horaire
                </dt>
                <dd>
                  {rateRange}{" "}
                  <span className="text-employer-text-secondary text-sm">
                    (indicatif)
                  </span>
                </dd>
              </>
            )}
          </dl>
        </section>

        <section aria-labelledby="mission-positions-heading" className="mt-10">
          <h2
            id="mission-positions-heading"
            className="mb-4 font-bold text-employer-primary text-xl"
          >
            Postes à pourvoir
          </h2>
          <ul className="flex flex-col gap-2">
            {positions.map((position) => (
              <li
                key={position.jobType}
                className="flex items-center justify-between rounded-lg border border-employer-border px-4 py-3"
              >
                <span className="font-medium text-employer-text-primary">
                  {position.label}
                </span>
                <span className="text-employer-text-secondary text-sm">
                  {remainingPlacesLabel(position.remaining)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {mission.description?.trim() && (
          <section
            aria-labelledby="mission-description-heading"
            className="mt-10"
          >
            <h2
              id="mission-description-heading"
              className="mb-4 font-bold text-employer-primary text-xl"
            >
              Description
            </h2>
            <p className="whitespace-pre-line text-employer-text-primary leading-relaxed">
              {mission.description.trim()}
            </p>
          </section>
        )}

        <section
          aria-labelledby="mission-apply-heading"
          className="mt-10 rounded-xl border-2 border-employer-primary p-6"
        >
          <h2
            id="mission-apply-heading"
            className="mb-4 font-bold text-employer-primary text-xl"
          >
            Candidater
          </h2>
          <ApplyToMission missionId={mission.id} positions={positions} />
        </section>
      </div>
    </div>
  );
}
