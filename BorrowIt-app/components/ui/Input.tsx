import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors, radius, font, spacing } from "../../lib/theme";

interface InputProps extends TextInputProps {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { ...font.labelMd, color: colors.textSecondary },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...font.bodyMd,
    color: colors.textPrimary,
    fontSize: 16,
  },
});
