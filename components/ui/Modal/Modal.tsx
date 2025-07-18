"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef
} from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  /** Contrôle l'affichage du modal */
  isOpen: boolean;
  /** Callback appelé lors de la fermeture */
  onClose: () => void;
  /** Contenu du modal */
  children: React.ReactNode;
  /** Classes CSS personnalisées pour le conteneur */
  className?: string;
  /** Classes CSS personnalisées pour le backdrop */
  backdropClassName?: string;
  /** Désactive la fermeture en cliquant sur le backdrop */
  disableBackdropClose?: boolean;
  /** Désactive la fermeture avec la touche Escape */
  disableEscapeClose?: boolean;
  /** Titre du modal pour l'accessibilité */
  ariaLabel?: string;
  /** ID de l'élément qui décrit le modal */
  ariaDescribedBy?: string;
  /** Taille prédéfinie du modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Position du modal */
  position?: "center" | "top" | "bottom";
  /** Animation d'entrée/sortie */
  animated?: boolean;
  /** Garde le focus à l'intérieur du modal */
  trapFocus?: boolean;
  /** Z-index personnalisé */
  zIndex?: number;
}

export interface ModalRef {
  focus: () => void;
  close: () => void;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw] max-h-[95vh]"
};

const positionClasses = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-16",
  bottom: "items-end justify-center pb-16"
};

export const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      className,
      backdropClassName,
      disableBackdropClose = false,
      disableEscapeClose = false,
      ariaLabel,
      ariaDescribedBy,
      size = "md",
      position = "center",
      animated = true,
      trapFocus = true,
      zIndex = 9999
    },
    ref
  ) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const isOpenRef = useRef(isOpen);

    // Expose des méthodes via ref
    useImperativeHandle(ref, () => ({
      focus: () => dialogRef.current?.focus(),
      close: () => onClose()
    }));

    // Gestion de l'ouverture/fermeture
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (isOpen && !isOpenRef.current) {
        dialog.showModal();

        // Focus trap optionnel
        if (trapFocus) {
          const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          firstElement?.focus();
        }
      } else if (!isOpen && isOpenRef.current) {
        dialog.close();
      }

      isOpenRef.current = isOpen;
    }, [isOpen, trapFocus]);

    // Gestion des événements clavier
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        // Escape pour fermer
        if (event.key === "Escape" && !disableEscapeClose) {
          event.preventDefault();
          onClose();
        }

        // Focus trap
        if (trapFocus && event.key === "Tab") {
          const focusableElements = dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      dialog.addEventListener("keydown", handleKeyDown);
      return () => dialog.removeEventListener("keydown", handleKeyDown);
    }, [onClose, disableEscapeClose, trapFocus]);

    // Gestion du clic sur le backdrop
    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog || disableBackdropClose) return;

      const handleClick = (event: MouseEvent) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isInDialog) {
          onClose();
        }
      };

      dialog.addEventListener("click", handleClick);
      return () => dialog.removeEventListener("click", handleClick);
    }, [onClose, disableBackdropClose]);

    // Gestion du scroll du body
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }, [isOpen]);

    // Render conditionnel
    if (!isOpen) return null;

    return (
      <dialog
        ref={dialogRef}
        className={cn(
          "fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none flex-col bg-transparent",
          positionClasses[position],
          `z-[${zIndex}]`,
          animated && "duration-200 animate-in fade-in-0",
          !isOpen && animated && "duration-200 animate-out fade-out-0",
          backdropClassName
        )}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        style={{
          zIndex,
          backgroundColor: "transparent"
        }}
      >
        <style jsx global>{`
          dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
        `}</style>
        <div
          className={cn(
            "relative mx-4 my-auto flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl",
            sizeClasses[size],
            animated && "duration-200 animate-in zoom-in-95",
            !isOpen && animated && "duration-200 animate-out zoom-out-95",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </dialog>
    );
  }
);

Modal.displayName = "Modal";
