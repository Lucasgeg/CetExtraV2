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
