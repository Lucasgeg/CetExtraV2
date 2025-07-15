"use client";
import dynamic from "next/dynamic";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type MapContainerComponentProps = {
  center: LatLngExpression;
  points: Point[];
  zoom?: number;
  height?: string;
  maxHeight?: string;
  className?: string;
  width?: string;
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

export default function MapContainerComponent({
  center,
  points,
  zoom = 17,
  height,
  maxHeight,
  className,
  width = "100%"
}: MapContainerComponentProps) {
  const DynamicMapWithHeight = dynamic(() => import("./DynamicMapContent"), {
    ssr: false,
    loading: () => (
      <div
        style={{
          height,
          maxHeight,
          width,
          borderRadius: "1.25em",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        className={className}
      >
        <div>Chargement de la carte...</div>
      </div>
    )
  });

  return (
    <DynamicMapWithHeight
      center={center}
      points={points}
      zoom={zoom}
      height={height}
      maxHeight=""
      width={width}
    />
  );
}
