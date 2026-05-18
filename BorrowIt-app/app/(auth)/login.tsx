import React, { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signIn, useInvalidateSession } from "../../lib/auth";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { colors, font, spacing, radius } from "../../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const invalidate = useInvalidateSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Fill in all fields");
    setLoading(true);
    try {
      await signIn(email, password);
      await invalidate();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>↕</Text>
            </View>
            <Text style={styles.wordmark}>Snip</Text>
            <Text style={styles.tagline}>Rent anything. From anyone.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
            />
            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>No account yet?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.link}> Create one</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.margin, gap: spacing.xl },
  header: { alignItems: "center", gap: spacing.sm },
  logoWrap: {
    width: 64, height: 64, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  logoIcon: { color: "#fff", fontSize: 28, fontWeight: "700" },
  wordmark: { ...font.headlineLg, color: colors.textPrimary },
  tagline: { ...font.bodyMd, color: colors.textMuted },
  form: { gap: spacing.md },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { ...font.bodyMd, color: colors.textSecondary },
  link: { ...font.bodyMd, fontWeight: "600", color: colors.primary },
});
