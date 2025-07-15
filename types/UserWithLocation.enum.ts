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
  isPrivacyProtected?: boolean;
}

export interface NearbyUsersResponse {
  users: UserWithLocation[];
  total: number;
  radius: number;
  center: { lat: number; lon: number };
  privacyProtected?: boolean;
}
