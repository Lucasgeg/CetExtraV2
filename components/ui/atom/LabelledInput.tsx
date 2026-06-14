import { cn } from "@/lib/utils";
import { Input } from "../input";
import { Suggestion } from "@/types/api";
import { AddressAutocomplete } from "./AutocompleteAdressSearch/AutocompleteAdressSearch";

interface LabelledInputProps {
  label: string;

  containerClassName?: string;
  inputClassName?: string;
  variant?: "input" | "location";
  locationProps?: {
    errorMessage?: string;
    handleClick: (suggestion: Suggestion | undefined) => void;
    value?: Suggestion;
  };
  inputProps?: {
    value: string | number | readonly string[] | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
  };
}

export const LabelledInput = ({
  label,
  inputClassName,
  containerClassName,
  variant = "input",
  locationProps,
  inputProps
}: LabelledInputProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-1 lg:flex-row",
        containerClassName
      )}
    >
      <span className="text-sm font-medium text-public-ink">{label}</span>
      {variant === "location" && locationProps && (
        <AddressAutocomplete
          missionlocation
          errorMessage={locationProps?.errorMessage}
          handleClick={locationProps.handleClick}
          value={locationProps?.value || undefined}
          inputclassName="w-full border-public-line bg-public-paper focus:border-public-brass focus:ring-public-brass"
        />
      )}
      {variant === "input" && (
        <Input
          value={inputProps?.value}
          onChange={inputProps?.onChange}
          className={`w-full max-w-40 border-public-line bg-public-paper focus:border-public-brass focus:ring-public-brass ${inputClassName}`}
          errorMessage={inputProps?.errorMessage}
        />
      )}
    </div>
  );
};
