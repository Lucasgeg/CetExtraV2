import React, { useState, useEffect, useCallback } from "react";

export interface SliderProps {
  /** Contrôle l'ouverture/fermeture du slider */
  isOpen: boolean;
  /** Callback lors de la demande de fermeture */
  onClose: () => void;
  /** Contenu du slider */
  children?: React.ReactNode;
  /** Titre du slider */
  title?: string;
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback lors de l'ouverture */
  onOpen?: () => void;
  /** Désactiver la fermeture en cliquant sur l'overlay */
  disableOverlayClose?: boolean;
  /** Désactiver la fermeture avec Escape */
  disableEscapeClose?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = "",
  onOpen,
  disableOverlayClose = false,
  disableEscapeClose = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Gérer l'ouverture/fermeture avec animations
  useEffect(() => {
    if (isOpen) {
      // Ouverture
      setShouldRender(true);
      // Petit délai pour permettre le render avant l'animation
      const openTimer = setTimeout(() => {
        setIsAnimating(true);
        onOpen?.();
      }, 10);

      return () => clearTimeout(openTimer);
    } else {
      // Fermeture
      setIsAnimating(false);
      // Attendre la fin de l'animation avant de démonter
      const closeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Durée de l'animation de fermeture

      return () => clearTimeout(closeTimer);
    }
  }, [isOpen, onOpen]);

  // Gérer la fermeture avec la touche Escape
  useEffect(() => {
    if (!isOpen || disableEscapeClose) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, disableEscapeClose]);

  // Bloquer le scroll du body quand le slider est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup au démontage
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    if (!disableOverlayClose) {
      onClose();
    }
  }, [onClose, disableOverlayClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // Empêcher la propagation pour éviter la fermeture
    e.stopPropagation();
  }, []);

  // Ne pas rendre si pas ouvert et pas en cours d'animation
  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[1050] ${className}`}>
      {/* Overlay - inchangé */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        } ${disableOverlayClose ? "cursor-default" : "cursor-pointer"}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Slider Panel - Modifié pour flex-col */}
      <div
        className={`fixed right-0 top-0 flex h-full w-full max-w-md transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out sm:max-w-xl ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "slider-title" : undefined}
      >
        {/* Header - inchangé */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 id="slider-title" className="text-lg font-semibold text-gray-900">
            {title || "Détails"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Fermer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content - Modifié pour h-full et flex-1 */}
        <div
          className={`flex-1 overflow-y-auto p-4 transition-opacity delay-150 duration-200 ease-in-out ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
