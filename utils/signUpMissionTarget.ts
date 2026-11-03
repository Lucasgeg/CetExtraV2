import { getSafeRedirectPath } from "@/utils/safeRedirect";

/**
 * Mission ciblée par un visiteur arrivé sur l'inscription depuis la vitrine
 * publique (`/sign-up?mission=<id>`, bouton « Candidater »).
 *
 * L'id est recopié en `sessionStorage` à l'arrivée sur la page : il survit au
 * rechargement et aux allers-retours hors du site (OAuth) dans le même
 * onglet, sans fuiter vers un autre onglet ni une inscription ultérieure
 * (contrairement à `localStorage` ou à un store Zustand persistant). Le
 * paramètre d'URL reste la source prioritaire, le stockage sert de relais.
 *
 * Après création d'un compte extra, on redirige vers `/missions/<id>` où
 * l'extra choisit son poste : pas de candidature automatique. Un compte
 * entreprise ignore la valeur.
 *
 * Navigation uniquement : l'autorisation reste vérifiée côté serveur.
 */

export const SIGN_UP_MISSION_PARAM = "mission";

const STORAGE_KEY = "cetextra:sign-up-mission";

// Ids Mission : `@default(uuid())` dans prisma/schema.prisma
const MISSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Id de mission au format attendu, ou null. */
export const parseMissionId = (
  raw: string | null | undefined
): string | null => (raw && MISSION_ID_PATTERN.test(raw) ? raw : null);

/**
 * Chemin interne `/missions/<id>` (validé par `getSafeRedirectPath`), ou null
 * si l'id est absent ou invalide.
 */
export const getMissionReturnPath = (
  missionId: string | null | undefined
): string | null => {
  const id = parseMissionId(missionId);
  if (!id) return null;
  return getSafeRedirectPath(`/missions/${id}`, "") || null;
};

// sessionStorage peut être indisponible (navigation privée, stockage bloqué)
const readStoredMission = () => {
  try {
    return parseMissionId(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

const storeMission = (missionId: string) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, missionId);
  } catch {
    // Le paramètre d'URL reste disponible en repli
  }
};

/** Oublie la mission ciblée (consommée, compte entreprise, connexion…). */
export const clearSignUpMission = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Rien à nettoyer si le stockage est indisponible
  }
};

const readMissionParam = (search: string) =>
  new URLSearchParams(search).get(SIGN_UP_MISSION_PARAM);

/**
 * À l'arrivée sur l'inscription : mémorise l'id valide passé en URL, oublie
 * toute valeur si le paramètre est présent mais invalide, et sinon conserve
 * la valeur déjà mémorisée (retour OAuth, URL perdue). Renvoie l'id retenu.
 */
export const syncSignUpMissionFromUrl = (search: string): string | null => {
  const raw = readMissionParam(search);
  if (raw === null) return readStoredMission();

  const missionId = parseMissionId(raw);
  if (missionId) {
    storeMission(missionId);
  } else {
    clearSignUpMission();
  }
  return missionId;
};

/**
 * Chemin de retour vers la mission ciblée, puis oubli de la valeur. Null si
 * aucune mission valide n'est mémorisée ni présente dans l'URL courante.
 */
export const consumeSignUpMissionPath = (): string | null => {
  const raw = readMissionParam(window.location.search);
  const missionId = raw === null ? readStoredMission() : parseMissionId(raw);
  clearSignUpMission();
  return getMissionReturnPath(missionId);
};
