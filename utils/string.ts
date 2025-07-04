export function capitalizeFirstLetter(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function isEmailValid(email: string): boolean {
  const regexp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return regexp.test(email);
}
