import { toZonedTime } from "date-fns-tz";

export function convertToFrenchTime(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Conversion automatique avec gestion été/hiver
  return toZonedTime(utcDate, "Europe/Paris");
}

export const getHoursMinutes = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Nouvelle fonction pour traiter les dates comme locales
export const getLocalHoursMinutes = (dateString: string): string => {
  // Si la date contient 'Z', on la traite comme UTC mais on veut l'heure locale
  const date = new Date(dateString);

  // Si vous voulez toujours afficher l'heure "telle qu'enregistrée"
  // sans conversion de timezone, utilisez cette approche :
  const localDateString = dateString.replace("Z", "");
  const localDate = new Date(localDateString);

  const hours = localDate.getHours().toString().padStart(2, "0");
  const minutes = localDate.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Ou pour une approche plus robuste avec gestion de timezone
export const formatDateTimeLocal = (dateString: string): string => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("fr-FR") +
    " à " +
    date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
};

export const formatDuration = (durationMs: number): string => {
  const totalMinutes = Math.floor(durationMs / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const remainingHours = totalHours % 24;
  const remainingMinutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} jour${days > 1 ? "s" : ""}`);
  }

  if (remainingHours > 0) {
    parts.push(`${remainingHours} heure${remainingHours > 1 ? "s" : ""}`);
  }

  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`);
  }

  if (parts.length === 0) {
    return "0 minute";
  }

  return parts.join(" ");
};
