import { Platform, TextStyle, ViewStyle } from "react-native";

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
  // Outline of inputs, switches and the selected segment (≥3:1 on canvas)
  controlLine: string;

  // Semantic
  success: string;
  successDeep: string;
  onSuccess: string;
  successTint: string;
  // Filled green action with a white label (Kaydet); the success hue is too light for white text
  confirm: string;
  confirmPress: string;
  onConfirm: string;

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

  // Redesigned screens (ui-history v14): list cards, tiles and bottom notices
  raised: string;
  header: string;
  card: string;
  cardLine: string;
  band: string;
  bandLine: string;
  readMuted: string;
  koliTile: string;
  koliInk: string;
  koliHero: string;
  koliHeroDeep: string;
  irs: string;
  irsTile: string;
  irsInk: string;
  okTile: string;
  okInk: string;
  notice: string;
  noticeLine: string;
  noticeOkTile: string;
  noticeOkInk: string;
  errTile: string;
  errInk: string;
  errLine: string;
  warnTile: string;
  warnInk: string;
  // Login stays white on the light theme: the logo artwork has a white ground
  loginPage: string;
  loginField: string;
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
  controlLine: "#797380",

  success: "#23C277",
  successDeep: "#159C5B",
  onSuccess: "#06130C",
  successTint: "#0E2419",
  confirm: "#15834E",
  confirmPress: "#106A3F",
  onConfirm: "#FFFFFF",

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

  raised: "#242228",
  header: "#0C0B0D",
  card: "#1B191E",
  cardLine: "#36323C",
  band: "#141317",
  bandLine: "#2B2830",
  readMuted: "#C6BFCE",
  koliTile: "#3B1A20",
  koliInk: "#F23643",
  koliHero: "#CC2434",
  koliHeroDeep: "#8E1016",
  irs: "#5250E0",
  irsTile: "#23224D",
  irsInk: "#B6B2FF",
  okTile: "#123224",
  okInk: "#6FDCA5",
  notice: "#26242A",
  noticeLine: "#3A3742",
  noticeOkTile: "#0E2419",
  noticeOkInk: "#23C277",
  errTile: "#3A0F14",
  errInk: "#FF5C66",
  errLine: "#FF3340",
  warnTile: "#2A2008",
  warnInk: "#F5A524",
  loginPage: "#0C0B0D",
  loginField: "#161518",
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
  primaryTint: "#FDE6E8",
  primaryRing: "#DA2128",

  ink: "#14161B",
  inkMuted: "#474D57",
  inkSubtle: "#5A606B",
  inkTertiary: "#9A98A0",
  inkDisabled: "#C2C0C7",

  canvas: "#EEF0F3",
  surface1: "#FFFFFF",
  surface2: "#E4E7EC",
  surface3: "#DADEE4",
  surface4: "#CFD3DA",
  hairline: "#D3D7DE",
  hairlineStrong: "#C9CED6",
  scrim: "rgba(0,0,0,0.45)",
  controlLine: "#7A808B",

  success: "#159C5B",
  successDeep: "#0E7A45",
  onSuccess: "#FFFFFF",
  successTint: "#DCF3E6",
  confirm: "#147B48",
  confirmPress: "#0F5F38",
  onConfirm: "#FFFFFF",

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
  infoTint: "#E9E8FD",

  statusOpen: "#B5740C",
  statusClosed: "#159C5B",
  statusShipped: "#3E3EC4",
  statusEmpty: "#76747C",

  raised: "#E4E7EC",
  header: "#FFFFFF",
  card: "#FFFFFF",
  cardLine: "#D3D7DE",
  band: "#F5F6F8",
  bandLine: "#E2E5EA",
  readMuted: "#474D57",
  koliTile: "#FDE6E8",
  koliInk: "#DA2128",
  koliHero: "#C62132",
  koliHeroDeep: "#8E1016",
  irs: "#4B48D4",
  irsTile: "#E9E8FD",
  irsInk: "#3D39A8",
  okTile: "#DCF3E6",
  okInk: "#0B6337",
  notice: "#FFFFFF",
  noticeLine: "#D3D7DE",
  noticeOkTile: "#DCF3E6",
  noticeOkInk: "#0B6337",
  errTile: "#FDE4E6",
  errInk: "#B3141C",
  errLine: "#D32030",
  warnTile: "#FBF0DA",
  warnInk: "#8A570A",
  loginPage: "#FFFFFF",
  loginField: "#EEF0F3",
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
  // Inputs, segments and form buttons of the redesigned screens
  control: 12,
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
  // Form scale of the redesigned screens (login, settings): nothing below 14 px.
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 39,
    letterSpacing: -0.6,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 31,
  },
  labelMd: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  labelStrong: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
  },
  // Codes and numbers: the sans with tabular numerals, never a monospace face.
  codeLg: {
    fontFamily: fonts.sans,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
  },
  codeMd: {
    fontFamily: fonts.sans,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    fontVariant: ["tabular-nums"],
  },
  quantity: {
    fontFamily: fonts.sans,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 29,
    fontVariant: ["tabular-nums"],
  },
} satisfies Record<string, TextStyle>;

// Card elevation exists only on the light theme; dark cards are separated by line.
const noShadow = {};
const lightCardShadow = {
  shadowColor: "#14161B",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 2,
};
const lightNoticeShadow = {
  shadowColor: "#14161B",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 12,
  elevation: 6,
};

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  cardShadow: ViewStyle;
  noticeShadow: ViewStyle;
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
    cardShadow: mode === "dark" ? noShadow : lightCardShadow,
    noticeShadow: mode === "dark" ? noShadow : lightNoticeShadow,
    spacing,
    radius,
    type,
    fonts,
  };
}

export const darkTheme = buildTheme("dark");
export const lightTheme = buildTheme("light");
