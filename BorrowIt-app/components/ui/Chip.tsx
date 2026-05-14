import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, font } from "../../lib/theme";

interface ChipProps {
  label: string;
  variant?: "available" | "pending" | "active" | "completed" | "disputed" | "default";
}

const variantColors: Record<string, { bg: string; text: string }> = {
  available: { bg: "#DCFCE7", text: "#166534" },
  pending: { bg: "#FEF9C3", text: "#854D0E" },
  active: { bg: "#DBEAFE", text: "#1E40AF" },
  completed: { bg: "#F3F4F6", text: "#374151" },
  disputed: { bg: "#FEE2E2", text: "#991B1B" },
  default: { bg: colors.background, text: colors.textSecondary },
};

export function Chip({ label, variant = "default" }: ChipProps) {
  const c = variantColors[variant] ?? variantColors.default;
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  text: { ...font.caption, fontWeight: "700" },
});
