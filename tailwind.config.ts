import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-gradient-start": "#22345E",
        "brand-gradient-mid": "#FDBA3B",
        "brand-gradient-end": "#F15A29",
        employer: {
          primary: "#33335E",
          secondary: "#2E7BA6",
          accent: "#EA5F3E",
          background: "#F4F7FA",
          surface: "#E6ECF3",
          border: "#C9D6E2",
          text: {
            primary: "#232336",
            secondary: "#5A5A7A"
          },
          success: "#4BB543",
          warning: "#F7B742",
          error: "#EA5F3E"
        },
        extra: {
          primary: "#F7B742",
          secondary: "#EA5F3E",
          accent: "#2E7BA6",
          background: "#FFF8ED",
          surface: "#FFF3D6",
          border: "#EFD08C",
          text: {
            primary: "#503C1B",
            secondary: "#9A7B3F"
          },
          success: "#4BB543",
          warning: "#F7B742",
          error: "#EA5F3E"
        },
        "white-soft": "#F4F7FA",
        "black-soft": "#232336",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        },
        gradientHover: {
          "0%": {
            backgroundPosition: "0% 50%"
          },
          "100%": {
            backgroundPosition: "100% 50%"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradientHover: "gradientHover 2s ease infinite"
      },
      backgroundImage: {
        "main-gradient": "linear-gradient(135deg, #06041B 0%, #33335E 100%)"
      },
      maxWidth: {
        "screen-3xl": "1920px",
        "screen-4xl": "2560px"
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
} satisfies Config;
