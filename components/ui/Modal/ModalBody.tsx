import React from "react";
import { cn } from "@/lib/utils";

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  scrollable = true
}) => (
  <div className={cn("flex-1 p-6", scrollable && "overflow-y-auto", className)}>
    {children}
  </div>
);
