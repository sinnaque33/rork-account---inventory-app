import { Platform, TextStyle } from "react-native";

/**
 * Extreme design system tokens (see DESIGN-extreme.md).
 * Dark-operational system: neutral near-black canvas, scarce Extreme-Red voltage,
 * four-step surface ladder, complete semantic palette.
 *
 * Two themes are exposed: `darkTheme` (the primary, fully-built surface) and
 * `lightTheme` (a sensible inverse mirror). Active theme is resolved by ThemeContext.
 */

export type ThemeMode = "dark" | "light";

export interface ThemeColors {
  // Brand (Extreme Red — the logo 'X' chevron)
  primary: string;
  primaryBright: string;
  primaryDeep: string;
  primaryPress: string;
  onPrimary: string;
  primaryTint: string;
  primaryRing: string;

  // Ink (text)
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  inkTertiary: string;
  inkDisabled: string;

  // Canvas & surface ladder
  canvas: string;
  surface1: string;
  surface2: string;
  surface3: string;
  surface4: string;
  hairline: string;
  hairlineStrong: string;
  scrim: string;

  // Semantic
  success: string;
  successDeep: string;
  onSuccess: string;
  successTint: string;

  error: string;
  errorDeep: string;
  onError: string;
  errorTint: string;

  warning: string;
  warningDeep: string;
  onWarning: string;
  warningTint: string;

  info: string;
  infoDeep: string;
  onInfo: string;
  infoTint: string;

  // Box (koli) status
  statusOpen: string;
  statusClosed: string;
  statusShipped: string;
  statusEmpty: string;
}

export const darkColors: ThemeColors = {
  primary: "#DA2128",
  primaryBright: "#F23643",
  primaryDeep: "#9E1318",
  primaryPress: "#7C0F14",
  onPrimary: "#FFFFFF",
  primaryTint: "#2A1316",
  primaryRing: "#F23643",

  ink: "#F6F6F7",
  inkMuted: "#A6A4AB",
  inkSubtle: "#76747C",
  inkTertiary: "#54525A",
  inkDisabled: "#403E45",

  canvas: "#0C0B0D",
  surface1: "#161518",
  surface2: "#1E1C21",
  surface3: "#26242A",
  surface4: "#2E2B32",
  hairline: "#2B2930",
  hairlineStrong: "#3A3742",
  scrim: "rgba(0,0,0,0.66)",

  success: "#23C277",
  successDeep: "#159C5B",
  onSuccess: "#06130C",
  successTint: "#0E2419",

  error: "#FF3340",
  errorDeep: "#B0121C",
  onError: "#FFFFFF",
  errorTint: "#2A1013",

  warning: "#F5A524",
  warningDeep: "#B5740C",
  onWarning: "#1A1304",
  warningTint: "#2A2008",

  info: "#5B5BF0",
  infoDeep: "#3E3EC4",
  onInfo: "#FFFFFF",
  infoTint: "#16162E",

  statusOpen: "#F5A524",
  statusClosed: "#23C277",
  statusShipped: "#5B5BF0",
  statusEmpty: "#76747C",
};

/**
 * Light mirror. The design treats a full light app theme as secondary; this is a
 * reasonable inverse using the design's `inverse-*` tokens, keeping brand red and
 * the semantic hues constant while flipping the surface ladder and ink.
 */
export const lightColors: ThemeColors = {
  primary: "#DA2128",
  primaryBright: "#F23643",
  primaryDeep: "#9E1318",
  primaryPress: "#7C0F14",
  onPrimary: "#FFFFFF",
  primaryTint: "#FBE9EA",
  primaryRing: "#DA2128",

  ink: "#161518",
  inkMuted: "#5A5860",
  inkSubtle: "#76747C",
  inkTertiary: "#9A98A0",
  inkDisabled: "#C2C0C7",

  canvas: "#FFFFFF",
  surface1: "#F5F5F6",
  surface2: "#ECECEE",
  surface3: "#E2E2E5",
  surface4: "#D7D7DB",
  hairline: "#E2E2E5",
  hairlineStrong: "#CFCFD4",
  scrim: "rgba(0,0,0,0.45)",

  success: "#159C5B",
  successDeep: "#0E7A45",
  onSuccess: "#FFFFFF",
  successTint: "#E4F6EC",

  error: "#D32030",
  errorDeep: "#B0121C",
  onError: "#FFFFFF",
  errorTint: "#FCE8EA",

  warning: "#B5740C",
  warningDeep: "#8A570A",
  onWarning: "#FFFFFF",
  warningTint: "#FBF0DA",

  info: "#3E3EC4",
  infoDeep: "#2D2D9C",
  onInfo: "#FFFFFF",
  infoTint: "#E8E8FB",

  statusOpen: "#B5740C",
  statusClosed: "#159C5B",
  statusShipped: "#3E3EC4",
  statusEmpty: "#76747C",
};

// --- Spacing (base 4px) ---
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  gutter: 16,
} as const;

// --- Radius ---
export const radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  pill: 9999,
} as const;

// --- Font families ---
// Custom brand faces (Inter / Space Grotesk / JetBrains Mono) are not yet bundled
// via expo-font; until then we fall back to platform system + monospace faces.
const sansFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});
const monoFamily = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export const fonts = {
  sans: sansFamily,
  display: sansFamily,
  mono: monoFamily,
} as const;

// --- Typography scale (lineHeight pre-computed to absolute px) ---
export const type = {
  displayXl: {
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 37,
    letterSpacing: -0.8,
  },
  displayLg: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontFamily: fonts.sans,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontFamily: fonts.sans,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  bodyLg: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 23,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  button: {
    fontFamily: fonts.sans,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  monoLg: {
    fontFamily: fonts.mono,
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  monoSm: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    letterSpacing: 0.2,
  },
} satisfies Record<string, TextStyle>;

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
  fonts: typeof fonts;
}

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    isDark: mode === "dark",
    colors: mode === "dark" ? darkColors : lightColors,
    spacing,
    radius,
    type,
    fonts,
  };
}

export const darkTheme = buildTheme("dark");
export const lightTheme = buildTheme("light");
