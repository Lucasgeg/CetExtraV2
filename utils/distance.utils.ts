/**
 * Utilitaires de carte pour le serveur (sans dépendances client)
 */

import { LatLngBounds } from "leaflet";

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
 * Ajoute une variation aléatoire aux coordonnées pour préserver la confidentialité
 * @param lat Latitude originale
 * @param lon Longitude originale
 * @param radiusKm Rayon de variation en kilomètres (défaut: 500m)
 * @returns Nouvelles coordonnées avec variation aléatoire
 */
export const randomizeCoordinates = (
  lat: number,
  lon: number,
  radiusKm: number = 0.5
): { lat: number; lon: number } => {
  // Conversion du rayon en degrés (approximation)
  // 1 degré ≈ 111 km
  const radiusInDegrees = radiusKm / 111;

  // Génération d'un angle aléatoire
  const angle = Math.random() * 2 * Math.PI;

  // Génération d'une distance aléatoire dans le rayon
  const distance = Math.random() * radiusInDegrees;

  // Calcul des nouvelles coordonnées
  const deltaLat = distance * Math.cos(angle);
  const deltaLon =
    (distance * Math.sin(angle)) / Math.cos((lat * Math.PI) / 180);

  return {
    lat: lat + deltaLat,
    lon: lon + deltaLon
  };
};

/**
 * Randomise les coordonnées avec une variation plus réaliste
 * @param lat Latitude originale
 * @param lon Longitude originale
 * @param minRadiusKm Rayon minimum en km
 * @param maxRadiusKm Rayon maximum en km
 * @returns Coordonnées randomisées
 */
export const randomizeCoordinatesAdvanced = (
  lat: number,
  lon: number,
  minRadiusKm: number = 0.1,
  maxRadiusKm: number = 0.8
): { lat: number; lon: number } => {
  const radiusKm = Math.random() * (maxRadiusKm - minRadiusKm) + minRadiusKm;
  return randomizeCoordinates(lat, lon, radiusKm);
};
