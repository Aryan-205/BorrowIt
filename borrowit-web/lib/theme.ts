/** BorrowIt-app/lib/theme.ts — shared tokens for Tailwind class maps and inline style. */
export const colors = {
  primary: "#000000",
  surface: "#FFFFFF",
  background: "#F6F6F6",
  accent: "#2563EB",
  darkSurface: "#1C1C1E",
  border: "#EEEEEE",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  textPrimary: "#000000",
  textSecondary: "#4C4546",
  textMuted: "#7E7576",
} as const;

export const radius = { sm: 8, md: 16, lg: 24, full: 9999 } as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  margin: 20,
} as const;
