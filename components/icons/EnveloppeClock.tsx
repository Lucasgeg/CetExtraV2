interface IconProps {
  /** Largeur de l'icône (nombre ou chaîne CSS valide comme "24px" ou "2rem") */
  width?: number | string;
  /** Hauteur de l'icône (nombre ou chaîne CSS valide comme "24px" ou "2rem") */
  height?: number | string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Couleur principale de l'icône (si non spécifiée dans className) */
  color?: string;
}

export const EnveloppeClock = ({
  className,
  width,
  height,
  color
}: IconProps) => {
  return (
    <svg
      width={width || "100%"}
      height={height || "100%"}
      viewBox="0 10 85 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="6"
        y="12"
        width="22"
        height="2"
        rx="1.5"
        fill={color || "#000"}
      />
      <rect
        x="6"
        y="22"
        width="18"
        height="2"
        rx="1.5"
        fill={color || "#000"}
      />
      <rect
        x="6"
        y="32"
        width="12"
        height="2"
        rx="1.5"
        fill={color || "#000"}
      />

      <rect
        x="30"
        y="10"
        width="44"
        height="28"
        rx="3.5"
        fill="#none"
        stroke={color || "#000"}
        strokeWidth="2"
      />
      <polyline
        points="32,12 52,30 72,12"
        fill="none"
        stroke={color || "#000"}
        strokeWidth="2"
      />
      <line
        x1="32"
        y1="36"
        x2="46"
        y2="23"
        stroke={color || "#000"}
        strokeWidth="2"
      />
      <line
        x1="72"
        y1="36"
        x2="58"
        y2="23"
        stroke={color || "#000"}
        strokeWidth="2"
      />

      <circle
        cx="70"
        cy="16"
        r="9"
        fill="#fff"
        stroke={"#000"}
        strokeWidth="2"
      />
      <line
        x1="70"
        y1="16"
        x2="70"
        y2="12"
        stroke={"#000"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="70"
        y1="16"
        x2="74"
        y2="16"
        stroke={"#000"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
