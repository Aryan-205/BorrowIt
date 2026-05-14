import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { colors, radius, font } from "../../lib/theme";

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ onPress, label, variant = "primary", loading, disabled, style }: ButtonProps) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : "#000"} size="small" />
      ) : (
        <Text style={[styles.label, isPrimary && { color: "#fff" }, isSecondary && { color: "#000" }, variant === "ghost" && { color: colors.accent }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  label: {
    ...font.headlineMd,
    fontSize: 16,
  },
});
