/**
 * Extra renvoyé par `GET /api/users/nearby`. `lat`/`lon` et `distance` sont
 * toujours calculés sur une position brouillée (grille ~1 km), jamais sur le
 * domicile exact.
 */
export interface UserWithLocation {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  lat: number;
  lon: number;
  distance?: number;
  job?: string;
  profileImageUrl?: string;
}

export interface NearbyUsersResponse {
  users: UserWithLocation[];
  total: number;
  radius: number;
  center: { lat: number; lon: number };
}
