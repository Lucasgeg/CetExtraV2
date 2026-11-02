import { useCallback, useEffect, useRef, useState } from "react";

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "success"
  | "denied"
  | "unavailable";

export type GeolocationCoords = { lat: number; lon: number };

type GeolocationState = {
  status: GeolocationStatus;
  coords: GeolocationCoords | null;
};

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 5 * 60_000
};

/**
 * Position du navigateur, demandée UNIQUEMENT à l'appel de `request()` (action
 * explicite de l'utilisateur), jamais au montage.
 *
 * - `denied` : l'utilisateur (ou le navigateur) a refusé l'accès ;
 * - `unavailable` : API absente, position introuvable ou délai dépassé.
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    coords: null
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const request = useCallback(
    () =>
      new Promise<GeolocationCoords | null>((resolve) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setState({ status: "unavailable", coords: null });
          resolve(null);
          return;
        }

        setState((previous) => ({ ...previous, status: "loading" }));

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            if (mountedRef.current) {
              setState({ status: "success", coords });
            }
            resolve(coords);
          },
          (error) => {
            if (mountedRef.current) {
              setState({
                status:
                  error.code === error.PERMISSION_DENIED
                    ? "denied"
                    : "unavailable",
                coords: null
              });
            }
            resolve(null);
          },
          GEOLOCATION_OPTIONS
        );
      }),
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle", coords: null });
  }, []);

  return { ...state, request, reset };
};
