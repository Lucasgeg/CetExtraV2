export enum ScreenSize {
  XS = "xs", // < 640px
  SM = "sm", // >= 640px
  MD = "md", // >= 768px
  LG = "lg", // >= 1024px
  XL = "xl", // >= 1280px
  XXL = "2xl" // >= 1536px
}

export interface ScreenInfo {
  size: ScreenSize;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallDesktop: boolean;
  isLargeDesktop: boolean;
}
