import type { PrismaMissionJob } from "@/store/types";
import { convertToFrontendMissionJob } from "@/utils/enum";

/**
 * Formatage des annonces publiques de mission, identique côté serveur et
 * navigateur (pas de dépendance aux données ICU/locale de l'environnement,
 * qui varient entre Node et navigateurs et provoqueraient des écarts
 * d'hydratation). Les dates sont toujours affichées à l'heure de Paris.
 */

const PARIS_TIME_ZONE = "Europe/Paris";

const DAYS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi"
];

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre"
];

const parisFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

type ParisDateParts = {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
  weekday: number;
};

const getParisParts = (input: Date | string): ParisDateParts => {
  const date = typeof input === "string" ? new Date(input) : input;
  const parts = Object.fromEntries(
    parisFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value] as const)
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  return {
    year,
    month,
    day,
    hour: (parts.hour ?? "00").padStart(2, "0"),
    minute: (parts.minute ?? "00").padStart(2, "0"),
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  };
};

const formatDay = ({ weekday, day, month, year }: ParisDateParts) =>
  `${DAYS[weekday]} ${day === 1 ? "1er" : day} ${MONTHS[month - 1]} ${year}`;

const formatTime = ({ hour, minute }: ParisDateParts) => `${hour}h${minute}`;

/**
 * Période d'une mission à l'heure de Paris, ex. :
 * - « samedi 14 novembre 2026, de 18h00 à 23h30 » (même jour) ;
 * - « du samedi 14 novembre 2026 à 18h00 au dimanche 15 novembre 2026 à 02h00 ».
 */
export const formatMissionPeriod = (
  start: Date | string,
  end: Date | string
): string => {
  const startParts = getParisParts(start);
  const endParts = getParisParts(end);
  const sameDay =
    startParts.year === endParts.year &&
    startParts.month === endParts.month &&
    startParts.day === endParts.day;

  if (sameDay) {
    return `${formatDay(startParts)}, de ${formatTime(startParts)} à ${formatTime(endParts)}`;
  }

  return `du ${formatDay(startParts)} à ${formatTime(startParts)} au ${formatDay(endParts)} à ${formatTime(endParts)}`;
};

const formatNumberFr = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(".", ",");
};

/** Montant en euros sans dépendre d'ICU, ex. « 15 € », « 15,50 € ». */
export const formatEuro = (value: number) => `${formatNumberFr(value)} €`;

/**
 * Fourchette de taux horaire indicative, ou `null` si absente (règle
 * applicative : les deux bornes ou aucune).
 */
export const formatHourlyRateRange = (
  min: number | null,
  max: number | null
): string | null => {
  if (min === null || max === null) return null;
  if (min === max) return `${formatEuro(min)} / heure`;
  return `${formatEuro(min)} à ${formatEuro(max)} / heure`;
};

/** Distance en km, ex. « 12,3 km ». */
export const formatDistanceKm = (km: number) =>
  `${Number.isInteger(km) ? km : km.toFixed(1).replace(".", ",")} km`;

/** Libellé français d'un poste (enum Prisma → libellé front). */
export const publicJobLabel = (jobType: string) =>
  convertToFrontendMissionJob(jobType as PrismaMissionJob);

export const remainingPlacesLabel = (remaining: number) =>
  `${remaining} place${remaining > 1 ? "s" : ""}`;

/** Lien vers le lieu de la mission sur openstreetmap.org. */
export const buildOpenStreetMapUrl = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
