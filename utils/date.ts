import { format } from "date-fns";
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
