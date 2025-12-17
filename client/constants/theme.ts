import { Platform } from "react-native";

export const GameColors = {
  primary: "#FF6B35",
  secondary: "#2C3E50",
  accent: "#F7B731",
  success: "#26A69A",
  danger: "#E74C3C",
  background: "#1A1A1D",
  surface: "#2C2C34",
  surfaceLight: "#404244",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B8",
  overlay: "rgba(0,0,0,0.85)",
  hudBackground: "rgba(44, 44, 52, 0.7)",
  hudBorder: "rgba(255,255,255,0.2)",
};

export const Colors = {
  light: {
    text: GameColors.textPrimary,
    buttonText: "#FFFFFF",
    tabIconDefault: GameColors.textSecondary,
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: GameColors.surfaceLight,
    backgroundTertiary: "#4A4A52",
  },
  dark: {
    text: GameColors.textPrimary,
    buttonText: "#FFFFFF",
    tabIconDefault: GameColors.textSecondary,
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: GameColors.surfaceLight,
    backgroundTertiary: "#4A4A52",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 36,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  mono: {
    fontSize: 18,
    fontWeight: "500" as const,
    fontFamily: Platform.select({
      ios: "ui-monospace",
      android: "monospace",
      default: "monospace",
    }),
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
};
