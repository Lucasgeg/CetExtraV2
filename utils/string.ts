export function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Prénom + nom séparés par une espace, en ignorant les parties vides ou
 * absentes. Renvoie `fallback` si aucune des deux n'est renseignée.
 */
export function formatFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback = ""
): string {
  return [firstName, lastName].filter(Boolean).join(" ") || fallback;
}

export function isEmailValid(email: string): boolean {
  const regexp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return regexp.test(email);
}
