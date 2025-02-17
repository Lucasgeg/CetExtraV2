import { cn } from "@/lib/utils";
import { Input } from "../input";

interface LabelledInputProps {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
  inputClassName?: string;
}

export const LabelledInput = ({
  label,
  value,
  onChange,
  inputClassName,
  containerClassName,
}: LabelledInputProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 flex-col lg:flex-row",
        containerClassName
      )}
    >
      <span>{label}</span>
      <Input
        value={value}
        onChange={onChange}
        className={`w-full max-w-40  ${inputClassName}`}
      />
    </div>
  );
};
