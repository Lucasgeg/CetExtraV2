import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

export type LoaderProps = {
  size?: "sm" | "md" | "lg" | "xl" | number;
  fullScreen?: boolean;
  className?: string;
  text?: string;
  variant?: "spinner" | "dots" | "pulse";
  textClassName?: string;
};

export const Loader = ({
  size = "md",
  fullScreen = false,
  className,
  text,
  variant = "spinner",
  textClassName
}: LoaderProps) => {
  // Gestion des classes CSS pour les tailles prédéfinies
  const getSizeClasses = () => {
    if (typeof size === "number") {
      return ""; // Pas de classe pour les tailles personnalisées
    }

    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "md":
        return "h-10 w-10";
      case "lg":
        return "h-16 w-16";
      case "xl":
        return "h-24 w-24";
      default:
        return "h-10 w-10";
    }
  };

  // Gestion du style inline pour les tailles personnalisées
  const getInlineStyle = () => {
    if (typeof size === "number") {
      return {
        width: `${size}px`,
        height: `${size}px`
      };
    }
    return undefined;
  };

  const containerClasses = cn(
    "flex items-center justify-center",
    fullScreen && "fixed inset-0 z-50 bg-black/20 backdrop-blur-sm",
    !fullScreen && "min-h-10 min-w-10",
    className
  );

  const loaderClasses = cn(
    styles.loader,
    getSizeClasses(),
    variant === "pulse" && styles.pulse,
    variant === "dots" && styles.dots
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={loaderClasses} style={getInlineStyle()} />
        {text && (
          <p
            className={cn(
              "animate-pulse text-center text-sm text-gray-600",
              textClassName
            )}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  );
};
