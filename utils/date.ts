import { toZonedTime } from "date-fns-tz";

export function convertToFrenchTime(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Conversion automatique avec gestion été/hiver
  return toZonedTime(utcDate, "Europe/Paris");
}
