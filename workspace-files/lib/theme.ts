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
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  margin: 20,
};

export const shadow = {
  ambient: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 4,
  },
};

export const font = {
  display: { fontFamily: "System", fontSize: 36, fontWeight: "800" as const, letterSpacing: -1.5 },
  headlineLg: { fontFamily: "System", fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.8 },
  headlineMd: { fontFamily: "System", fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.5 },
  bodyLg: { fontFamily: "System", fontSize: 17, fontWeight: "400" as const },
  bodyMd: { fontFamily: "System", fontSize: 15, fontWeight: "400" as const },
  labelMd: { fontFamily: "System", fontSize: 13, fontWeight: "600" as const, letterSpacing: 0.3 },
  caption: { fontFamily: "System", fontSize: 12, fontWeight: "500" as const },
};
