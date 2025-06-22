import React, { useState } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = {
  onText?: string;
  offText?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export const Switch = ({
  onText = "ON",
  offText = "OFF",
  defaultChecked = false,
  checked,
  onChange,
  disabled = false,
  className,
  size = "md"
}: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const isControlled = checked !== undefined;
  const switchState = isControlled ? checked : isChecked;

  const handleToggle = () => {
    if (disabled) return;

    const newState = !switchState;
    if (!isControlled) {
      setIsChecked(newState);
    }
    onChange?.(newState);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "h-6 w-11",
          thumb: "h-4 w-4",
          text: "text-xs"
        };
      case "lg":
        return {
          container: "h-8 w-16",
          thumb: "h-6 w-6",
          text: "text-sm"
        };
      default:
        return {
          container: "h-7 w-12",
          thumb: "h-5 w-5",
          text: "text-xs"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={switchState}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          sizeClasses.container,
          switchState ? "bg-blue-600" : "bg-gray-200",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="sr-only">{switchState ? onText : offText}</span>
        <span
          className={cn(
            "pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
            sizeClasses.thumb,
            switchState ? "translate-x-9" : "translate-x-0"
          )}
        />
      </button>

      <span
        className={cn(
          "font-semibold transition-colors duration-200",
          sizeClasses.text,
          switchState ? "text-blue-600" : "text-gray-500",
          disabled && "opacity-50"
        )}
      >
        {switchState ? onText : offText}
      </span>
    </div>
  );
};
