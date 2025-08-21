import { useState, useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { UserWithLocation } from "@/types/UserWithLocation.enum";
import { useMapUsers } from "@/hooks/useMapUser";
import {
  filterUsersByDistance,
  getVisibleRadius
} from "@/utils/distance.utils";
import { Loader } from "../ui/Loader/Loader";
import ExtraMarker from "../ui/Markers/ExtraMarkers";
import L from "leaflet";
import { UserSlider } from "../UserSlider/UserSlider";
import { useUserResearchStore } from "@/store/useUserResearchStore";

interface MapWithUserFilterProps {
  center: LatLngExpression;
  missionLocation: { lat: number; lon: number };
  onUsersFiltered?: (users: UserWithLocation[]) => void;
  showInfo?: boolean;
  autoFetch?: boolean;
  initialRadius?: number;
  preservePrivacy?: boolean;
}

interface MapInfoProps {
  visibleRadius: number;
  totalUsers: number;
  filteredUsers: number;
  loading?: boolean;
  privacyProtected?: boolean;
}

const svgMissionMarker = (size = 56) => `
  <svg width="${size}" height="${size * 1.25}" viewBox="0 0 56 70" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow-mission" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#33335E" flood-opacity="0.25"/>
      </filter>
      <linearGradient id="gradient-mission" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2E7BA6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#33335E;stop-opacity:1" />
      </linearGradient>
    </defs>
    <!-- Bordure blanche -->
    <ellipse cx="28" cy="28" rx="26" ry="26" fill="white" filter="url(#shadow-mission)"/>
    <!-- Fond principal avec dégradé -->
    <ellipse cx="28" cy="28" rx="22" ry="22" fill="url(#gradient-mission)"/>
    <!-- Icône calendar -->
    <g transform="translate(28, 28)" fill="white">
      <rect x="-8" y="-6" width="16" height="12" rx="2" fill="white"/>
      <rect x="-6" y="-4" width="12" height="8" rx="1" fill="url(#gradient-mission)"/>
      <line x1="-4" y1="-8" x2="-4" y2="-4" stroke="white" stroke-width="1.5"/>
      <line x1="4" y1="-8" x2="4" y2="-4" stroke="white" stroke-width="1.5"/>
      <line x1="-6" y1="-1" x2="6" y2="-1" stroke="white" stroke-width="1"/>
      <circle cx="-3" cy="1" r="1" fill="white"/>
      <circle cx="0" cy="1" r="1" fill="white"/>
      <circle cx="3" cy="1" r="1" fill="white"/>
      <circle cx="-3" cy="4" r="1" fill="white"/>
      <circle cx="0" cy="4" r="1" fill="white"/>
    </g>
    <!-- Pointe goutte -->
    <path d="M28,69 Q19,48 28,51 Q37,48 28,69Z" fill="url(#gradient-mission)"/>
  </svg>
`;

const missionIcon = L.divIcon({
  html: svgMissionMarker(),
  className: "",
  iconSize: [56, 70],
  iconAnchor: [28, 70]
});

const MapInfo = ({
  visibleRadius,
  totalUsers,
  filteredUsers,
  loading = false,
  privacyProtected = false
}: MapInfoProps) => {
  return (
    <div className="absolute left-2 top-2 z-[1000] rounded bg-white p-2 text-sm shadow-md">
      <div className="flex flex-col gap-1">
        <div>
          <strong>Rayon visible:</strong> {visibleRadius.toFixed(2)} km
        </div>
        <div>
          <strong>Extras affichés:</strong>{" "}
          {loading ? "..." : `${filteredUsers}/${totalUsers}`}
        </div>
        {privacyProtected && (
          <div className="text-xs text-blue-600">
            🔒 Positions approximatives (confidentialité)
          </div>
        )}
        {loading && (
          <div className="text-xs text-gray-500">
            <Loader fullScreen size="xl" />
          </div>
        )}
      </div>
    </div>
  );
};

const MapEventHandler = ({
  users,
  missionLocation,
  onUsersFiltered,
  onRadiusChange
}: {
  users: UserWithLocation[];
  missionLocation: { lat: number; lon: number };
  onUsersFiltered: (users: UserWithLocation[]) => void;
  onRadiusChange?: (radius: number) => void;
  onInitialLoad?: () => void;
}) => {
  const map = useMap();
  const hasInitiallyLoaded = useRef(false);

  const filterAndNotify = (
    centerLat: number,
    centerLon: number,
    radius: number
  ) => {
    const filteredUsers = filterUsersByDistance(
      users,
      centerLat,
      centerLon,
      radius
    ) as UserWithLocation[];

    onUsersFiltered(filteredUsers);
    onRadiusChange?.(radius);
  };

  // Déclencher le filtrage initial basé sur les bounds de la carte
  useEffect(() => {
    if (users.length > 0 && !hasInitiallyLoaded.current) {
      const bounds = map.getBounds();
      const visibleRadius = getVisibleRadius(bounds);
      filterAndNotify(missionLocation.lat, missionLocation.lon, visibleRadius);
      hasInitiallyLoaded.current = true;
    }
  }, [users, map, missionLocation]);

  useMapEvents({
    zoomend: () => {
      const bounds = map.getBounds();
      const visibleRadius = getVisibleRadius(bounds);
      filterAndNotify(missionLocation.lat, missionLocation.lon, visibleRadius);
    },

    moveend: () => {
      const bounds = map.getBounds();
      const visibleRadius = getVisibleRadius(bounds);
      filterAndNotify(missionLocation.lat, missionLocation.lon, visibleRadius);
    }
  });

  return null;
};

export const MapWithUserFilter = ({
  center,
  missionLocation,
  onUsersFiltered,
  showInfo = true,
  autoFetch = true,
  initialRadius = 2.5
}: MapWithUserFilterProps) => {
  const [visibleUsers, setVisibleUsers] = useState<UserWithLocation[]>([]);
  const [visibleRadius, setVisibleRadius] = useState(initialRadius);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const {
    requiredPositions,
    missionEndDate,
    missionStartDate,
    missionId,
    missionName
  } = useUserResearchStore();

  // Stabiliser missionLocation avec useMemo
  const stableMissionLocation = useMemo(
    () => ({
      lat: missionLocation.lat,
      lon: missionLocation.lon
    }),
    [missionLocation.lat, missionLocation.lon]
  );

  // Utiliser useRef pour la callback
  const onUsersFilteredRef = useRef(onUsersFiltered);

  // Mettre à jour la ref sans déclencher de re-render
  useEffect(() => {
    onUsersFilteredRef.current = onUsersFiltered;
  });

  // Utilisation du hook pour récupérer les utilisateurs
  const { users, loading, error, privacyProtected } = useMapUsers({
    missionLocation: stableMissionLocation,
    enabled: autoFetch,
    radius: 50,
    preservePrivacy: true
  });

  const handleUsersFiltered = (filteredUsers: UserWithLocation[]) => {
    setVisibleUsers(filteredUsers);
    onUsersFilteredRef.current?.(filteredUsers);
  };

  const handleRadiusChange = (radius: number) => {
    setVisibleRadius(radius);
  };

  const handleUserMarkerClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSliderClose = () => {
    setSelectedUserId(undefined);
  };

  // Trouver l'utilisateur sélectionné
  const selectedUser = visibleUsers.find((user) => user.id === selectedUserId);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-red-50">
        <div className="text-center text-red-600">
          <p className="font-semibold">Erreur de chargement</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapEventHandler
          users={users}
          missionLocation={stableMissionLocation}
          onUsersFiltered={handleUsersFiltered}
          onRadiusChange={handleRadiusChange}
        />

        {/* Marker pour la mission */}
        <Marker
          position={[stableMissionLocation.lat, stableMissionLocation.lon]}
          icon={missionIcon}
        >
          <Popup>
            <div className="text-center">
              <strong>{missionName}</strong>
            </div>
          </Popup>
        </Marker>

        {/* Afficher les utilisateurs filtrés */}
        {visibleUsers.map((user) => (
          <ExtraMarker
            key={user.id}
            position={[user.lat, user.lon]}
            fallbackInitial={
              user.firstName.charAt(0).toUpperCase() +
              "." +
              user.lastName.charAt(0).toUpperCase()
            }
            photoUrl={user.profileImageUrl}
            size={64}
            onClick={() => handleUserMarkerClick(user.id)}
          ></ExtraMarker>
        ))}
      </MapContainer>

      {/* Informations sur le filtrage */}
      {showInfo && (
        <MapInfo
          visibleRadius={visibleRadius}
          totalUsers={users.length}
          filteredUsers={visibleUsers.length}
          loading={loading}
          privacyProtected={privacyProtected}
        />
      )}

      {/* Slider pour afficher les détails de l'utilisateur */}
      {selectedUserId && (
        <UserSlider
          isOpen={!!selectedUserId}
          onClose={handleSliderClose}
          userId={selectedUserId}
          title={`Profil de ${selectedUser?.name}`}
          requiredPositions={requiredPositions}
          missionEndDate={missionEndDate}
          missionStartDate={missionStartDate}
          missionId={missionId || ""}
        />
      )}
    </div>
  );
};
