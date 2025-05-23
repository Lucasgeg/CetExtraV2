import { cn } from "@/lib/utils";
import { Input } from "../input";

interface LabelledInputProps {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
  inputClassName?: string;
  errorMessage?: string;
}

export const LabelledInput = ({
  label,
  value,
  onChange,
  inputClassName,
  containerClassName,
  errorMessage
}: LabelledInputProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-1 lg:flex-row",
        containerClassName
      )}
    >
      <span>{label}</span>
      <Input
        value={value}
        onChange={onChange}
        className={`w-full max-w-40 lg:max-w-max ${inputClassName}`}
        errorMessage={errorMessage}
      />
    </div>
  );
};
