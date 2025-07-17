import React from "react";
import { cn } from "@/lib/utils";

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className
}) => <div className={cn("border-t p-6", className)}>{children}</div>;
