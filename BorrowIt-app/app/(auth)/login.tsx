import React, { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Alert, Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authClient } from "../../lib/auth";
import { DEV_BYPASS_KEY } from "./_layout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { colors, font, spacing, radius } from "../../lib/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const handleLogin = async () => {
    if (devMode) {
      await AsyncStorage.setItem(DEV_BYPASS_KEY, "true");
      router.replace("/(tabs)");
      return;
    }
    if (!email || !password) return Alert.alert("Fill in all fields");
    setLoading(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) Alert.alert("Error", res.error.message ?? "Login failed");
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
          {/* Wordmark */}
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
              editable={!devMode}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              editable={!devMode}
            />
            <Button
              label={devMode ? "Skip to App (Dev)" : "Sign In"}
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          {/* Dev mode toggle */}
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>Dev mode</Text>
            <Switch
              value={devMode}
              onValueChange={setDevMode}
              trackColor={{ false: colors.border, true: "#F59E0B" }}
              thumbColor={devMode ? "#fff" : "#fff"}
            />
          </View>
          {devMode && (
            <Text style={styles.devHint}>Auth skipped — tap button to enter the app</Text>
          )}

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
  devRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#FFFBEB",
    borderWidth: 1, borderColor: "#FDE68A",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  devLabel: { ...font.labelMd, color: "#92400E" },
  devHint: { ...font.caption, color: "#B45309", textAlign: "center", marginTop: -spacing.md },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { ...font.bodyMd, color: colors.textSecondary },
  link: { ...font.bodyMd, fontWeight: "600", color: colors.primary },
});
