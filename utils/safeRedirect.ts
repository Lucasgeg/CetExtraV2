/**
 * Validation d'une cible de redirection interne (ex. `redirect_url` après
 * connexion) par le parseur d'URL, et non par préfixes : le parseur retire
 * tabulations et sauts de ligne et traite `\` comme `/`, ce qui contourne
 * les tests de préfixe (`"/\t/evil.com"` → `https://evil.com/`).
 *
 * Fonction pure : l'origine est passée en paramètre (`window.location.origin`
 * côté navigateur) ; côté serveur, l'origine factice fixe par défaut suffit,
 * seule l'égalité d'origine compte.
 */

const PLACEHOLDER_ORIGIN = "https://redirect.invalid";

// Caractères de contrôle C0 (U+0000–U+001F) et DEL (U+007F), testés par
// code plutôt que par regex (noControlCharactersInRegex)
const hasControlCharacter = (value: string) => {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
};

const isUnsafeRaw = (value: string) =>
  hasControlCharacter(value) || value.includes("\\");

/**
 * Chemin interne sûr (`pathname + search + hash`) ou `fallback`.
 *
 * Refuse : valeur absente, caractère de contrôle ou `\` (brut ou une fois
 * décodé), origine différente après parsing (URL absolue, `//hôte`,
 * `javascript:`…), et chemin dont la forme décodée commence par `//`.
 */
export const getSafeRedirectPath = (
  raw: string | null | undefined,
  fallback = "/",
  origin = PLACEHOLDER_ORIGIN
): string => {
  if (!raw || isUnsafeRaw(raw)) return fallback;

  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return fallback;
  }
  if (url.origin !== origin) return fallback;

  // Défense en profondeur : un chemin encodé (`/%2F%2Fevil.com`,
  // `/%5Cevil.com`, `/%09/…`) ne doit pas redevenir protocol-relative ou
  // porteur de contrôles une fois décodé par un routeur en aval
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    return fallback;
  }
  if (isUnsafeRaw(decodedPath) || decodedPath.startsWith("//")) {
    return fallback;
  }

  return url.pathname + url.search + url.hash;
};
