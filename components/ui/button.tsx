import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { EnumRole } from "@/store/types";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gray-200 text-gray-900 shadow hover:bg-gray-100 border border-gray-300 hover:border-gray-400",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        disabled:
          "bg-gray-200 text-gray-900 shadow hover:bg-gray-100 border border-gray-300 hover:border-gray-400 cursor-not-allowed"
      },
      fullWidth: {
        true: "w-full",
        false: "w-fit"
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        pill: "rounded-full"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default"
    }
  }
);

const getThemeClasses = (
  theme: "company" | "extra" | undefined,
  variant: string = "default"
) => {
  // Palette employeur
  if (theme === EnumRole.COMPANY) {
    switch (variant) {
      case "default":
        return "bg-employer-primary text-employer-warning border border-employer-border hover:bg-employer-secondary hover:text-employer-primary";
      case "destructive":
        return "bg-employer-accent text-white-soft border border-employer-accent hover:bg-employer-accent/90";
      case "outline":
        return "bg-employer-background text-employer-primary border border-employer-primary hover:bg-employer-surface";
      case "secondary":
        return "bg-employer-secondary text-white-soft border border-employer-secondary hover:bg-employer-secondary/80";
      case "ghost":
        return "bg-transparent text-employer-primary hover:bg-employer-surface";
      case "link":
        return "text-employer-accent underline-offset-4 hover:underline";
      case "disabled":
        return "bg-employer-surface text-employer-text-secondary border border-employer-border cursor-not-allowed";
      default:
        return "";
    }
  }
  // Palette extra
  else {
    switch (variant) {
      case "default":
        return "bg-extra-primary text-extra-text-primary border border-extra-border hover:bg-extra-secondary hover:text-extra-surface";
      case "destructive":
        return "bg-extra-secondary text-white-soft border border-extra-secondary hover:bg-extra-secondary/90";
      case "outline":
        return "bg-extra-background text-extra-text-primary border border-extra-primary hover:bg-extra-surface";
      case "secondary":
        return "bg-extra-secondary text-white-soft border border-extra-secondary hover:bg-extra-secondary/80";
      case "ghost":
        return "bg-transparent text-extra-text-primary hover:bg-extra-surface";
      case "link":
        return "text-extra-secondary underline-offset-4 hover:underline";
      case "disabled":
        return "bg-extra-surface text-extra-text-secondary border border-extra-border cursor-not-allowed";
      default:
        return "";
    }
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  theme?: "company" | "extra";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      fullWidth = false,
      rounded,
      theme,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const themeClasses = getThemeClasses(theme, variant || "default");

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className, fullWidth, rounded }),
          themeClasses
        )}
        ref={ref}
        disabled={variant === "disabled"}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
