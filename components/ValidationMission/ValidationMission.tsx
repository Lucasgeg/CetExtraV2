"use client";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./ValidationMission.module.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false
});

type Point = {
  id: string;
  position: LatLngExpression;
  label: string;
};

const points: Point[] = [
  { id: "1", position: [48.8566, 2.3522], label: "Paris" },
  { id: "2", position: [45.764, 4.8357], label: "Lyon" }
  // Ajoute d'autres points ici
];

export default function ValidationMission() {
  const center: LatLngExpression = [47.0, 2.0]; // Centre de la France

  return (
    <MapContainer
      style={{ height: "400px", width: "100%" }}
      center={center}
      zoom={5}
      className={styles["leaflet-tile"]}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {points.map((point) => (
        <Marker key={point.id} position={point.position}>
          <Popup>{point.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
