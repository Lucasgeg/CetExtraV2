import logo from "@/assets/cetextralogo.jpeg";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const CetExtraLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image alt="logo Cet Extra" src={logo} className={`w-full h-full`} />
    </div>
  );
};
