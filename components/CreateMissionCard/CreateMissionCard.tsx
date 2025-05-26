import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import React from "react";

type CreateMissionCardProps = {
  title: string;
  id: string;
  type: string;
  placeholder: string;
  icon?: React.ReactNode;
  iconContainerClassName?: string;
  variant?: "input" | "textarea";
  errorMessage?: string;
  className?: string;
  // Props pour React Hook Form (Controller ou register)
  inputProps?: React.InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>;
  };
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    ref?: React.Ref<HTMLTextAreaElement>;
  };
};

export const CreateMissionCard = ({
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
  textareaProps
}: CreateMissionCardProps) => {
  return (
    <Card className={cn("h-full max-h-36", className)}>
      <CardHeader className="flex flex-row items-center justify-start gap-2 pb-2">
        <div className={cn("rounded-lg p-1", iconContainerClassName)}>
          {icon}
        </div>
        <h2 className="w-auto text-lg font-semibold text-employer-primary">
          {title}
        </h2>
      </CardHeader>
      <CardContent>
        {variant === "input" && (
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            errorMessage={errorMessage}
            className="w-full border-employer-border focus:border-employer-secondary focus:ring-employer-secondary md:h-14"
            {...inputProps}
          />
        )}

        {variant === "textarea" && (
          <div className="w-full">
            <textarea
              id={id}
              placeholder={placeholder}
              className={cn(
                "w-full resize-none rounded-md border-employer-border p-2 focus:border-employer-secondary focus:ring-employer-secondary md:h-20",
                errorMessage && "border-red-500"
              )}
              {...textareaProps}
            />
            {errorMessage && (
              <div className="mt-1 max-w-56 text-justify text-sm text-red-500">
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
