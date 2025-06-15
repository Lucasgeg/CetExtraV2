"use client";
import dynamic from "next/dynamic";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapContainerComponentProps = {
  center: LatLngExpression;
  points: BasePoint[];
  zoom?: number;
  height?: string;
};

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

const DynamicMap = dynamic(() => import("./DynamicMapContent"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "400px",
        width: "100%",
        borderRadius: "1.25em",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div>Chargement de la carte...</div>
    </div>
  )
});

export default function MapContainerComponent({
  center,
  points,
  zoom = 17,
  height = "400px"
}: MapContainerComponentProps) {
  return (
    <DynamicMap center={center} points={points} zoom={zoom} height={height} />
  );
}
