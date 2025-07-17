import { useState, useEffect } from "react";
import { ScreenSize, ScreenInfo } from "@/types/Screen.enum";

// Breakpoints Tailwind CSS
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;

export const useScreenSize = (): ScreenInfo => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>(() => {
    // Valeurs par défaut pour le SSR
    if (typeof window === "undefined") {
      return {
        size: ScreenSize.MD,
        width: 768,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isSmallDesktop: false,
        isLargeDesktop: false
      };
    }

    return getScreenInfo(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo(getScreenInfo(window.innerWidth));
    };

    // Initialiser avec la taille actuelle
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenInfo;
};

// Fonction utilitaire pour déterminer les informations d'écran
const getScreenInfo = (width: number): ScreenInfo => {
  let size: ScreenSize;

  if (width >= BREAKPOINTS["2xl"]) {
    size = ScreenSize.XXL;
  } else if (width >= BREAKPOINTS.xl) {
    size = ScreenSize.XL;
  } else if (width >= BREAKPOINTS.lg) {
    size = ScreenSize.LG;
  } else if (width >= BREAKPOINTS.md) {
    size = ScreenSize.MD;
  } else if (width >= BREAKPOINTS.sm) {
    size = ScreenSize.SM;
  } else {
    size = ScreenSize.XS;
  }

  return {
    size,
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isSmallDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isLargeDesktop: width >= BREAKPOINTS.xl
  };
};

// Hook utilitaire pour des breakpoints spécifiques
export const useBreakpoint = (
  breakpoint: keyof typeof BREAKPOINTS
): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
    const mediaQuery = window.matchMedia(query);

    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [breakpoint]);

  return matches;
};
