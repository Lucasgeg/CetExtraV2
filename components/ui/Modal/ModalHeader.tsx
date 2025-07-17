import React from "react";
import { cn } from "@/lib/utils";

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
  showCloseButton = true,
  onClose
}) => (
  <div
    className={cn("flex items-center justify-between border-b p-6", className)}
  >
    <div className="flex-1">{children}</div>
    {showCloseButton && onClose && (
      <button
        onClick={onClose}
        className="ml-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
    )}
  </div>
);
