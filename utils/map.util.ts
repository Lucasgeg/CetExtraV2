import { useEffect, useState } from "react";
import { calculateDistance } from "./distance.utils";

interface UseMapDistanceProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: Array<{ lat: number; lon: number; [key: string]: any }>;
  missionLocation: { lat: number; lon: number };
  zoom: number;
}

export const useMapDistance = ({
  users,
  missionLocation,
  zoom
}: UseMapDistanceProps) => {
  const [visibleUsers, setVisibleUsers] = useState(users);
  const [visibleRadius, setVisibleRadius] = useState(0);

  useEffect(() => {
    const zoomToRadius = {
      8: 78, // 78 km
      9: 39, // 39 km
      10: 20, // 20 km
      11: 10, // 10 km
      12: 5, // 5 km
      13: 2.5, // 2.5 km
      14: 1.25, // 1.25 km
      15: 0.625, // 625 m
      16: 0.312, // 312 m
      17: 0.156, // 156 m
      18: 0.078 // 78 m
    };

    const radius = zoomToRadius[zoom as keyof typeof zoomToRadius] || 50;
    setVisibleRadius(radius);

    const filtered = users.filter((user) => {
      const distance = calculateDistance(
        missionLocation.lat,
        missionLocation.lon,
        user.lat,
        user.lon
      );
      return distance <= radius;
    });

    setVisibleUsers(filtered);
  }, [users, missionLocation, zoom]);

  return { visibleUsers, visibleRadius };
};
