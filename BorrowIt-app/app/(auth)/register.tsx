import React, { useState } from "react";
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { signUp, useInvalidateSession } from "../../lib/auth";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { colors, font, spacing, radius } from "../../lib/theme";
import { MapPin, NavigationArrow } from "phosphor-react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const invalidate = useInvalidateSession();

  // Step 1 state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 state
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleStep1 = () => {
    if (!name || !email || !password) return Alert.alert("Fill in all fields");
    if (password.length < 8) return Alert.alert("Password must be at least 8 characters");
    setStep(2);
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Enable location in settings to auto-fill your city.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (geocode.length > 0) {
        const g = geocode[0];
        setCity(g.city ?? g.region ?? "");
        setAddress([g.street, g.district, g.city].filter(Boolean).join(", "));
      }
    } catch {
      Alert.alert("Could not detect location");
    } finally {
      setLocating(false);
    }
  };

  const handleRegister = async () => {
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

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoIcon}>B</Text>
            </View>
            <Text style={styles.wordmark}>Join BorrowIt</Text>
            <Text style={styles.tagline}>
              {step === 1 ? "List your stuff. Make passive income." : "Where are you based?"}
            </Text>
          </View>

          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
          </View>

          {/* Step 1 */}
          {step === 1 && (
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
              <PasswordInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
              />
              <Button label="Continue →" onPress={handleStep1} />
            </View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <View style={styles.form}>
              {/* GPS auto-fill */}
              <TouchableOpacity
                style={styles.gpsBtn}
                onPress={detectLocation}
                disabled={locating}
                activeOpacity={0.75}
              >
                {locating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <NavigationArrow size={18} weight="fill" color={colors.primary} />
                )}
                <Text style={styles.gpsBtnText}>
                  {locating ? "Detecting location…" : coords ? "Location detected ✓" : "Use my current location"}
                </Text>
              </TouchableOpacity>

              <Input
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="Mumbai"
              />
              <Input
                label="Address (optional)"
                value={address}
                onChangeText={setAddress}
                placeholder="Street, area…"
              />

              {coords && (
                <View style={styles.coordsBadge}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.coordsText}>
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </Text>
                </View>
              )}

              <Button label="Create Account" onPress={handleRegister} loading={loading} />

              <TouchableOpacity onPress={() => handleRegister()} activeOpacity={0.6}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
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
  tagline: { ...font.bodyMd, color: colors.textMuted, textAlign: "center" },

  stepRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: colors.border, borderRadius: 1 },
  stepLineActive: { backgroundColor: colors.primary },

  form: { gap: spacing.md },

  gpsBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    backgroundColor: "#EFF6FF",
  },
  gpsBtnText: { ...font.labelMd, color: colors.primary, fontWeight: "600" },

  coordsBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    alignSelf: "flex-start",
  },
  coordsText: { ...font.caption, color: colors.textMuted },

  skipText: {
    ...font.bodyMd, color: colors.textMuted,
    textAlign: "center", textDecorationLine: "underline",
    marginTop: -spacing.xs,
  },

  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { ...font.bodyMd, color: colors.textSecondary },
  link: { ...font.bodyMd, fontWeight: "600", color: colors.primary },
});
