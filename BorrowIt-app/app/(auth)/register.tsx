import React, { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signUp, useInvalidateSession } from "../../lib/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { colors, font, spacing, radius } from "../../lib/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const invalidate = useInvalidateSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Fill in all fields");
    if (password.length < 8) return Alert.alert("Password must be at least 8 characters");
    setLoading(true);
    try {
      await signUp(name, email, password);
      await invalidate();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>↕</Text>
            </View>
            <Text style={styles.wordmark}>Join Borrow-It</Text>
            <Text style={styles.tagline}>List your stuff. Make passive income.</Text>
          </View>

          <View style={styles.form}>
            <Input label="Full Name" value={name} onChangeText={setName} placeholder="Alex Johnson" />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min. 8 characters"
            />
            <Button label="Create Account" onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}> Sign In</Text>
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
