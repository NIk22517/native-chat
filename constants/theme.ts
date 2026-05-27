/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// constants/Colors.ts

export const Colors = {
  light: {
    // ── Text ────────────────────────────────────────────────────
    text: "#111111",
    textSecondary: "#3F3F46",
    textMuted: "#71717A",
    textDisabled: "#A1A1AA",
    textInverse: "#FFFFFF",

    // ── Backgrounds / Surfaces ──────────────────────────────────
    background: "#FFFFFF",
    surface: "#F4F4F5", // input bg, secondary screens
    elevated: "#EBEBEC", // modals, bottom sheets
    overlay: "#E4E4E5", // pressed states, selection bg

    // ── Brand / Primary ─────────────────────────────────────────
    primary: "#4F4DE8",
    primaryLight: "#E8E8FF",
    primaryDark: "#3730A3",

    // ── Borders ─────────────────────────────────────────────────
    border: "#E4E4E5",
    borderStrong: "#D4D4D8",

    // ── Semantic ────────────────────────────────────────────────
    success: "#16A34A",
    successLight: "#DCFCE7",
    error: "#DC2626",
    errorLight: "#FEE2E2",
    warning: "#D97706",
    warningLight: "#FEF3C7",
    info: "#0284C7",
    infoLight: "#E0F2FE",

    // ── Chat specific ───────────────────────────────────────────
    sentBubble: "#4F4DE8", // sent message bg
    sentBubbleText: "#FFFFFF", // sent message text
    receivedBubble: "#F4F4F5", // received message bg
    receivedBubbleText: "#111111", // received message text
    readReceipt: "#53BDEB", // double tick read colour
    deliveredReceipt: "#A1A1AA", // double tick delivered colour
    searchHighlight: "#FAC775", // search match highlight
    searchHighlightText: "#412402", // text on highlight

    // ── UI tokens ───────────────────────────────────────────────
    tint: "#4F4DE8",
    icon: "#71717A",
    tabIconDefault: "#A1A1AA",
    tabIconSelected: "#4F4DE8",
    inputBackground: "#F4F4F5",
    placeholder: "#A1A1AA",
    skeleton: "#E4E4E5", // loading skeleton bg
    skeletonHighlight: "#F4F4F5", // skeleton shimmer
    shadow: "rgba(0, 0, 0, 0.08)",
  },

  dark: {
    // ── Text ────────────────────────────────────────────────────
    text: "#F5F5F5",
    textSecondary: "#A1A1AA",
    textMuted: "#71717A",
    textDisabled: "#52525B",
    textInverse: "#111111",

    // ── Backgrounds / Surfaces ──────────────────────────────────
    background: "#111111",
    surface: "#1C1C1E",
    elevated: "#2C2C2E",
    overlay: "#3A3A3C",

    // ── Brand / Primary ─────────────────────────────────────────
    primary: "#6D6AFF",
    primaryLight: "#1E1B6E",
    primaryDark: "#A09EFF",

    // ── Borders ─────────────────────────────────────────────────
    border: "#2C2C2E",
    borderStrong: "#3A3A3C",

    // ── Semantic ────────────────────────────────────────────────
    success: "#22C55E",
    successLight: "#052E16",
    error: "#EF4444",
    errorLight: "#450A0A",
    warning: "#F59E0B",
    warningLight: "#451A03",
    info: "#38BDF8",
    infoLight: "#0C1A2E",

    // ── Chat specific ───────────────────────────────────────────
    sentBubble: "#4F4DE8",
    sentBubbleText: "#FFFFFF",
    receivedBubble: "#2C2C2E",
    receivedBubbleText: "#F5F5F5",
    readReceipt: "#53BDEB",
    deliveredReceipt: "#71717A",
    searchHighlight: "#FAC775",
    searchHighlightText: "#412402",

    // ── UI tokens ───────────────────────────────────────────────
    tint: "#6D6AFF",
    icon: "#71717A",
    tabIconDefault: "#52525B",
    tabIconSelected: "#6D6AFF",
    inputBackground: "#1C1C1E",
    placeholder: "#52525B",
    skeleton: "#2C2C2E",
    skeletonHighlight: "#3A3A3C",
    shadow: "rgba(0, 0, 0, 0.4)",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorToken = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
