import type React from "react";
import { cn } from "@/lib/utils";
import type { Suggestion } from "@/types/api";
import { AddressAutocomplete } from "../ui/atom/AutocompleteAdressSearch/AutocompleteAdressSearch";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import MultipleSelector, { type Option } from "../ui/MultipleSelector";
import styles from "./MissionCard.module.css";

type CreateMissionCardProps = {
  title: string;
  id: string;
  type: string;
  placeholder: string;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  variant?: "input" | "textarea" | "select" | "location";
  errorMessage?: string;
  className?: string;
  // Props pour React Hook Form (Controller ou register)
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>;
  };
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: React.Ref<HTMLTextAreaElement>;
  };
  selectProps?: {
    options: Option[];
    value: Option[];
    onChange: (options: Option[]) => void;
    placeholder?: string;
    maxSelected?: number;
    creatable?: boolean;
    withSearch?: boolean;
  };
  locationProps?: {
    errorMessage?: string;
    handleClick: (suggestion: Suggestion | undefined) => void;
    value?: Suggestion;
    disabled?: boolean;
  };
};

export const MissionCard = ({
  id,
  placeholder,
  title,
  type,
  icon,
  iconContainerClassName,
  variant = "input",
  className,
  errorMessage,
  inputProps,
  textareaProps,
  selectProps,
  locationProps
}: CreateMissionCardProps) => {
  return (
    <Card className={cn("flex h-full min-h-0 flex-1 flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-start gap-2 pb-2">
        <div
          className={cn(
            "rounded-lg p-1",
            iconContainerClassName,
            styles.iconWrapper
          )}
        >
          {icon}
        </div>
        <h2 className="w-auto font-semibold text-employer-primary text-lg">
          {title}
        </h2>
      </CardHeader>
      <CardContent
        className={cn(
          "flex h-full flex-col",
          variant === "select" ? "justify-start" : "justify-center"
        )}
      >
        {variant === "input" && (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            errorMessage={errorMessage}
            className="w-full border-employer-border focus:border-employer-secondary focus:ring-employer-secondary"
            {...inputProps}
          />
        )}

        {variant === "textarea" && (
          <>
            <textarea
              id={id}
              placeholder={placeholder}
              className={cn(
                "min-h-0 w-full flex-1 resize-none rounded-md border-employer-border p-2 focus:border-employer-secondary focus:ring-employer-secondary",
                errorMessage && "border-red-500"
              )}
              {...textareaProps}
            />
            {errorMessage && (
              <div className="mt-1 max-w-56 text-justify text-red-500 text-sm">
                {errorMessage}
              </div>
            )}
          </>
        )}

        {variant === "select" && selectProps && (
          <MultipleSelector
            placement="bottom"
            badgeClassName="bg-extra-primary text-employer-primary hover:bg-employer-secondary"
            withSearch={selectProps.withSearch}
            options={selectProps.options}
            value={selectProps.value}
            onChange={selectProps.onChange}
            placeholder={selectProps.placeholder}
            maxSelected={selectProps.maxSelected}
            creatable={selectProps.creatable}
            className="w-full border-employer-border bg-employer-background focus:border-employer-secondary focus:ring-employer-secondary"
          />
        )}

        {variant === "location" && locationProps?.handleClick && (
          <AddressAutocomplete
            missionlocation
            errorMessage={locationProps?.errorMessage}
            handleClick={locationProps.handleClick}
            value={locationProps?.value || undefined}
            inputclassName="w-full border-employer-border bg-employer-background focus:border-employer-secondary focus:ring-employer-secondary"
            disabled={locationProps?.disabled}
          />
        )}
      </CardContent>
    </Card>
  );
};
