// MarkerWithPhoto.tsx
import { Marker } from "react-leaflet";
import L from "leaflet";
import { PropsWithChildren } from "react";

type ExtraMarkerProps = PropsWithChildren & {
  position: [number, number]; // Latitude, Longitude
  photoUrl?: string;
  size?: number; // Diamètre du marker en pixels
  fallbackInitial?: string; // Initiale à afficher si pas de photo
  isHighlighted?: boolean; // Pour l'animation
};

const ExtraMarker: React.FC<ExtraMarkerProps> = ({
  position,
  photoUrl,
  size = 48,
  fallbackInitial = "E",
  children,
  isHighlighted = true
}) => {
  const svgMarkup = `
<svg width="${size}" height="${size * 1.2}" viewBox="0 0 64 76" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="bubbleClip-${position[0]}-${position[1]}">
        <circle cx="32" cy="32" r="26"/>
      </clipPath>
      <filter id="shadow-extra-${position[0]}-${position[1]}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#503C1B" flood-opacity="0.25"/>
      </filter>
      <linearGradient id="gradient-extra-${position[0]}-${position[1]}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#F7B742;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#EA5F3E;stop-opacity:1" />
      </linearGradient>
      ${
        isHighlighted
          ? `
      <animate attributeName="r" values="32;36;32" dur="2s" repeatCount="indefinite"/>
      `
          : ""
      }
    </defs>
    <!-- Bordure blanche avec ombre -->
    <circle cx="32" cy="32" r="30" fill="white" filter="url(#shadow-extra-${position[0]}-${position[1]})"/>
    <!-- Fond avec dégradé -->
    <circle cx="32" cy="32" r="28" fill="url(#gradient-extra-${position[0]}-${position[1]})"/>
    ${
      isHighlighted
        ? `
    <!-- Cercle d'animation -->
    <circle cx="32" cy="32" r="32" fill="none" stroke="#F7B742" stroke-width="2" opacity="0.6">
      <animate attributeName="r" values="32;36;32" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
    </circle>
    `
        : ""
    }
    ${
      photoUrl
        ? `<image href="${photoUrl}" x="6" y="6" width="52" height="52" clip-path="url(#bubbleClip-${position[0]}-${position[1]})" preserveAspectRatio="xMidYMid slice" />`
        : `<text x="50%" y="42%" text-anchor="middle" fill="white" font-size="18" font-family="Arial, sans-serif" font-weight="bold" dy=".3em">${fallbackInitial}</text>`
    }
    <!-- Pointe avec dégradé -->
    <path d="M32,72 Q22,54 32,56 Q42,54 32,72Z" fill="url(#gradient-extra-${position[0]}-${position[1]})"/>
  </svg>
`;

  const icon = L.divIcon({
    html: svgMarkup,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size]
  });

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
};

export default ExtraMarker;
