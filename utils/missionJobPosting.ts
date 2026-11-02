import {
  formatHourlyRateRange,
  formatMissionPeriod,
  publicJobLabel,
  remainingPlacesLabel
} from "@/utils/publicMission.format";
import type { PublicMissionDetail } from "@/utils/publicMissions.server";

/**
 * Décompose une adresse libre « [rue], 69001 Lyon, France » (format produit
 * par l'autocomplétion) en champs PostalAddress. Si le code postal n'est pas
 * reconnu, l'adresse entière reste dans `streetAddress`.
 */
export const parseFrenchAddress = (fullName: string) => {
  const match = fullName.match(/^(.*?)[,\s]*\b(\d{5})\s+([^,]+)/);
  if (!match) {
    return { streetAddress: fullName };
  }
  const [, street, postalCode, locality] = match;
  return {
    streetAddress: street.trim() || fullName,
    postalCode,
    addressLocality: locality.trim()
  };
};

/**
 * Description publique d'une mission : celle saisie par l'employeur, sinon
 * un résumé généré (postes, lieu, dates) — JobPosting exige une description.
 */
export const buildMissionDescription = (mission: PublicMissionDetail) => {
  if (mission.description?.trim()) {
    return mission.description.trim();
  }
  const positions = mission.requiredPositions
    .map(
      ({ jobType, remaining }) =>
        `${publicJobLabel(jobType)} (${remainingPlacesLabel(remaining)})`
    )
    .join(", ");
  const rate = formatHourlyRateRange(
    mission.hourlyRateMin,
    mission.hourlyRateMax
  );
  return [
    `${mission.creator.company_name} recherche des extras pour la mission « ${mission.name} » : ${positions}.`,
    mission.missionLocation
      ? `Lieu : ${mission.missionLocation.fullName}.`
      : "",
    `Dates (heure de Paris) : ${formatMissionPeriod(mission.missionStartDate, mission.missionEndDate)}.`,
    rate ? `Taux horaire indicatif : ${rate}.` : ""
  ]
    .filter(Boolean)
    .join(" ");
};

/**
 * Données structurées schema.org `JobPosting` d'une mission visible
 * publiquement. `url` est omise (facultative) : aucune base d'URL absolue
 * n'est configurable aujourd'hui, la page porte déjà son canonical.
 */
export const buildMissionJobPosting = (mission: PublicMissionDetail) => {
  const hasRateRange =
    mission.hourlyRateMin !== null && mission.hourlyRateMax !== null;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: mission.name,
    description: buildMissionDescription(mission),
    identifier: {
      "@type": "PropertyValue",
      name: mission.creator.company_name,
      value: mission.id
    },
    datePosted: mission.createdAt.toISOString(),
    validThrough: mission.missionStartDate.toISOString(),
    employmentType: "TEMPORARY",
    hiringOrganization: {
      "@type": "Organization",
      name: mission.creator.company_name
    },
    ...(mission.missionLocation && {
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          ...parseFrenchAddress(mission.missionLocation.fullName),
          addressCountry: "FR"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: mission.missionLocation.lat,
          longitude: mission.missionLocation.lon
        }
      }
    }),
    ...(hasRateRange && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "EUR",
        value: {
          "@type": "QuantitativeValue",
          minValue: mission.hourlyRateMin,
          maxValue: mission.hourlyRateMax,
          unitText: "HOUR"
        }
      }
    })
  };
};

/**
 * Sérialise des données JSON-LD pour un `<script type="application/ld+json">`
 * : échappe `<`, `>`, `&` et les séparateurs U+2028/U+2029, pour qu'aucune
 * valeur saisie (ex. `</script>` dans une description) ne puisse fermer la
 * balise ni injecter de HTML.
 */
export const serializeJsonLd = (data: unknown) =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
