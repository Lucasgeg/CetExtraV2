/**
 * Utilitaires de carte pour le serveur (sans dépendances client)
 */

import type { LatLngBounds } from "leaflet";

/**
 * Calcule la distance entre deux points en kilomètres (formule de Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Filtre les utilisateurs selon la distance
 */
export const filterUsersByDistance = <T extends { lat: number; lon: number }>(
  users: T[],
  centerLat: number,
  centerLon: number,
  maxDistance: number
): T[] => {
  return users.filter((user) => {
    const distance = calculateDistance(
      centerLat,
      centerLon,
      user.lat,
      user.lon
    );
    return distance <= maxDistance;
  });
};

/**
 * Calcule le rayon visible de la carte en km
 */
export const getVisibleRadius = (bounds: LatLngBounds): number => {
  const center = bounds.getCenter();
  const northEast = bounds.getNorthEast();

  return calculateDistance(
    center.lat,
    center.lng,
    northEast.lat,
    northEast.lng
  );
};

/**
 * Pas de la grille d'anonymisation en latitude (≈ 1 km : 1° ≈ 111,2 km).
 */
export const OBFUSCATION_GRID_STEP_LAT_DEG = 0.009;

/**
 * Amplitude du décalage intra-cellule, en fraction de la taille de cellule.
 * 0.5 → décalage de ±25 % de la cellule autour de son centre : le point affiché
 * reste dans la cellule, à ~1 km au plus de la position réelle.
 */
const OBFUSCATION_JITTER_RATIO = 0.5;

/**
 * Hash FNV-1a 32 bits ramené dans [0, 1). Pur JS (pas de `node:crypto`, ce
 * module est aussi importé côté client) et stable d'une exécution à l'autre.
 */
const hashToUnitInterval = (input: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0x100000000;
};

/**
 * Brouille une position (domicile d'un extra) de façon déterministe avant de
 * l'exposer à un tiers. Fonction pure : même entrée → même sortie.
 *
 * 1. Accrochage à une grille d'≈ 1 km : la position réelle est remplacée par
 *    le centre de sa cellule. Le pas en longitude dépend de la latitude de la
 *    *rangée* (et non de la latitude réelle), sinon la grille glisserait avec
 *    la position réelle et en laisserait fuiter une partie.
 * 2. Décalage déterministe dans la cellule, dérivé de `seed` (ex. `user.id`),
 *    uniquement pour que les extras d'une même cellule ne s'empilent pas sur
 *    la carte. La position réelle étant déjà effacée à l'étape 1, ce décalage
 *    peut dériver d'une donnée publique : aucune clé secrète n'est requise.
 *
 * Tout ce qui est exposé (coordonnées, distance, filtre de rayon, tri) doit
 * être calculé à partir du résultat de cette fonction, jamais de l'entrée.
 */
export const obfuscateCoordinates = (
  lat: number,
  lon: number,
  seed: string
): { lat: number; lon: number } => {
  const stepLat = OBFUSCATION_GRID_STEP_LAT_DEG;
  const rowCenterLat = (Math.floor(lat / stepLat) + 0.5) * stepLat;

  // Cellules ~carrées : le pas en longitude s'élargit avec la latitude.
  const cosLat = Math.max(Math.cos((rowCenterLat * Math.PI) / 180), 0.01);
  const stepLon = stepLat / cosLat;
  const cellCenterLon = (Math.floor(lon / stepLon) + 0.5) * stepLon;

  const offsetLat =
    (hashToUnitInterval(`${seed}:lat`) - 0.5) *
    stepLat *
    OBFUSCATION_JITTER_RATIO;
  const offsetLon =
    (hashToUnitInterval(`${seed}:lon`) - 0.5) *
    stepLon *
    OBFUSCATION_JITTER_RATIO;

  return {
    lat: rowCenterLat + offsetLat,
    lon: cellCenterLon + offsetLon
  };
};
