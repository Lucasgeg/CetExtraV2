import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

export type LoaderProps = {
  size?: number;
};

export const Loader = ({ size }: LoaderProps) => {
  return (
    <div className={cn("flex min-h-10 min-w-10 items-center justify-center")}>
      <div
        className={cn(styles.loader, size && `h-${size || 20} w-${size || 20}`)}
      />
    </div>
  );
};
