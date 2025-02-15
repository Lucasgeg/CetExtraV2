import { cn } from "@/lib/utils";
import { Input } from "../input";

interface LabelledInputProps {
  label: string;
  value: string;
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
        "flex items-center justify-between gap-1 ",
        containerClassName
      )}
    >
      <span>{label}</span>
      <Input
        value={value}
        onChange={onChange}
        className={`w-auto max-w-40  ${inputClassName}`}
      />
    </div>
  );
};
