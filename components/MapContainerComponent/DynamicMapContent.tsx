"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { type LatLngExpression, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapContainerComponent.module.css";
import { cn } from "@/lib/utils";

type BasePoint = {
  id: string;
  position: LatLngExpression;
  label: string;
};

export type MissionPoint = BasePoint & {
  variant: "mission";
};

export type ExtraPoint = BasePoint & {
  variant: "extra";
  extraId: string;
  role: string;
  imageUrl: string;
};

export type Point = MissionPoint | ExtraPoint;

type DynamicMapContentProps = {
  center: LatLngExpression;
  points: BasePoint[];
  zoom?: number;
  height?: string;
  maxHeight?: string;
  className?: string;
};

const missionIcon = divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="#F7B742" viewBox="0 0 24 24" stroke="#EA5F3E" stroke-width="2" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3)); display: block;">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"></path>
    </svg>
  `,
  className: "!bg-transparent !border-none !shadow-none",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export default function DynamicMapContent({
  center,
  points,
  zoom = 17,
  height,
  maxHeight,
  className
}: DynamicMapContentProps) {
  return (
    <MapContainer
      style={{
        height: height,
        minHeight: "300px",
        width: "100%",
        borderRadius: "1.25em",
        maxHeight
      }}
      center={center}
      zoom={zoom}
      className={cn(styles.mapContainer, className)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {points.map((point) => (
        <Marker key={point.id} position={point.position} icon={missionIcon}>
          <Popup>{point.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
