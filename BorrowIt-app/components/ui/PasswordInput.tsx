import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TextInputProps } from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";
import { colors, radius, font, spacing } from "../../lib/theme";

interface PasswordInputProps extends TextInputProps {
  label: string;
}

export function PasswordInput({ label, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          {...props}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          style={styles.toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeSlash size={20} color={colors.textMuted} />
          ) : (
            <Eye size={20} color={colors.textMuted} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { ...font.labelMd, color: colors.textSecondary },
  inputWrap: { position: "relative", justifyContent: "center" },
  input: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingLeft: spacing.md,
    paddingRight: 48,
    paddingVertical: 14,
    ...font.bodyMd,
    color: colors.textPrimary,
    fontSize: 16,
  },
  toggle: {
    position: "absolute",
    right: spacing.md,
    height: "100%",
    justifyContent: "center",
  },
});
