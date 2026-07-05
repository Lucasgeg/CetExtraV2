import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types/api";
import { Input } from "../input";
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
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      <span className="font-semibold text-employer-text-primary text-sm">
        {label}
      </span>
      {variant === "location" && locationProps && (
        <AddressAutocomplete
          missionlocation
          errorMessage={locationProps?.errorMessage}
          handleClick={locationProps.handleClick}
          value={locationProps?.value || undefined}
          inputclassName="w-full border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary"
        />
      )}
      {variant === "input" && (
        <Input
          value={inputProps?.value}
          onChange={inputProps?.onChange}
          className={cn(
            "w-full border-extra-border bg-extra-background focus:border-extra-secondary focus:ring-extra-secondary",
            inputClassName
          )}
          errorMessage={inputProps?.errorMessage}
        />
      )}
    </div>
  );
};
