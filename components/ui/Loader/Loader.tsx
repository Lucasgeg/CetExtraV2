import { cn } from "@/lib/utils";
import styles from "./Loader.module.css";

export type LoaderProps = {
  size?: number;
};

export const Loader = ({ size }: LoaderProps) => {
  return (
    <div className={cn("min-h-10 min-w-10 flex justify-center items-center")}>
      <div
        className={cn(styles.loader, size && `h-${size || 20} w-${size || 20}`)}
      />
    </div>
  );
};
