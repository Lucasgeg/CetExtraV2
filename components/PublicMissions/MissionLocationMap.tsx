"use client";
import dynamic from "next/dynamic";
import type { MissionPoint } from "@/components/MapContainerComponent/DynamicMapContent";
import { buildOpenStreetMapUrl } from "@/utils/publicMission.format";

// Au niveau module : un dynamic() dans le rendu remonterait la carte à chaque
// fois. Leaflet accède à `window` à l'import, d'où le rendu client uniquement.
const DynamicMapContent = dynamic(
  () => import("@/components/MapContainerComponent/DynamicMapContent"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="h-full w-full animate-pulse bg-employer-border"
      />
    )
  }
);

type MissionLocationMapProps = {
  lat: number;
  lon: number;
  label: string;
};

export function MissionLocationMap({
  lat,
  lon,
  label
}: MissionLocationMapProps) {
  const point: MissionPoint = {
    id: "mission",
    position: [lat, lon],
    label,
    variant: "mission"
  };

  return (
    <div className="mt-6">
      {/* La hauteur vit sur ce conteneur, commun à la carte et au placeholder
          (pas de décalage de mise en page). `isolate` confine les z-index des
          panes Leaflet (≥ 400) sous le header sticky en z-50. */}
      <figure
        aria-label={`Plan de situation de la mission : ${label}`}
        className="isolate h-48 overflow-hidden rounded-xl border border-employer-border sm:h-56"
      >
        <DynamicMapContent
          center={[lat, lon]}
          points={[point]}
          zoom={15}
          height="100%"
          minHeight="0"
          className="!rounded-none"
          interactive={false}
        />
      </figure>
      <a
        href={buildOpenStreetMapUrl(lat, lon)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex rounded-sm font-semibold text-employer-text-secondary text-sm transition-colors hover:text-employer-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-employer-secondary"
      >
        Ouvrir dans OpenStreetMap
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    </div>
  );
}
