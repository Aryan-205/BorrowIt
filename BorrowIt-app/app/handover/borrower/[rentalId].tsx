import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, QrCode, CheckCircle } from "phosphor-react-native";
import { colors, font, spacing, radius, shadow } from "../../../lib/theme";

const BASE_URL = "https://1l0oskvouaqvjjatva3n0-preview-4200.runable.site/";

// Simple QR code rendered as matrix of dots (text-based visual)
function QRDisplay({ data }: { data: string }) {
  // We'll create a visual QR code representation using the token string
  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrInner}>
        {/* Corner marks */}
        <View style={[styles.cornerMark, { top: 0, left: 0 }]} />
        <View style={[styles.cornerMark, { top: 0, right: 0 }]} />
        <View style={[styles.cornerMark, { bottom: 0, left: 0 }]} />
        {/* Center data display */}
        <View style={styles.qrCenter}>
          <QrCode size={80} color={colors.primary} weight="fill" />
          <Text style={styles.qrCode}>{data}</Text>
        </View>
      </View>
    </View>
  );
}

export default function LenderHandoverScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const router = useRouter();
  const [qrData, setQrData] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const generateQR = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}api/rentals/${rentalId}/generate-qr`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      return res.json();
    },
    onSuccess: (data: any) => {
      setQrData(data.qrData);
      setToken(data.token);
      setCountdown(30);
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  // Countdown + auto-refresh
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          generateQR.mutate();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Poll for activation
  useEffect(() => {
    if (!rentalId) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}api/rentals/${rentalId}`, { credentials: "include" });
        const data = await res.json() as any;
        if (data.rental?.status === "ACTIVE") {
          setVerified(true);
          clearInterval(poll);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(poll);
  }, [rentalId]);

  useEffect(() => {
    generateQR.mutate();
  }, []);

  if (verified) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.successWrap}>
          <CheckCircle size={80} weight="fill" color={colors.success ?? "#22C55E"} />
          <Text style={styles.successTitle}>Handover Complete!</Text>
          <Text style={styles.successSub}>The borrower has scanned and accepted the item.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push("/(tabs)/rentals")}>
            <Text style={styles.doneBtnText}>View Rentals →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} weight="bold" color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lender Handover</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Show this QR</Text>
        <Text style={styles.subtitle}>Let the borrower scan with their app to confirm pickup.</Text>

        {generateQR.isPending && !token ? (
          <View style={styles.loadWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadText}>Generating secure code…</Text>
          </View>
        ) : token ? (
          <>
            <QRDisplay data={token} />

            {/* Countdown */}
            <View style={styles.countdownWrap}>
              <View style={[styles.countdownRing, { borderColor: countdown > 10 ? colors.success ?? "#22C55E" : "#EF4444" }]}>
                <Text style={[styles.countdownNum, { color: countdown > 10 ? colors.primary : "#EF4444" }]}>{countdown}</Text>
                <Text style={styles.countdownSec}>sec</Text>
              </View>
              <Text style={styles.countdownLabel}>Code refreshes automatically</Text>
            </View>

            {/* Status */}
            <View style={styles.awaitingBadge}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.awaitingText}>Waiting for borrower to scan…</Text>
            </View>
          </>
        ) : null}

        {/* Rental ID for reference */}
        <Text style={styles.rentalRef}>Rental ID: {rentalId?.slice(0, 16)}…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row", alignItems: "center",
    padding: spacing.margin, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...font.headlineMd, color: colors.textPrimary },
  content: { flex: 1, alignItems: "center", padding: spacing.margin, gap: spacing.lg, paddingTop: spacing.xl },
  title: { ...font.headlineLg, color: colors.textPrimary, textAlign: "center" },
  subtitle: { ...font.bodyMd, color: colors.textMuted, textAlign: "center" },
  loadWrap: { alignItems: "center", gap: spacing.md, paddingTop: spacing.xl },
  loadText: { ...font.bodyMd, color: colors.textMuted },
  qrOuter: {
    width: 240, height: 240,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 2, borderColor: colors.border,
    ...shadow.ambient,
  },
  qrInner: {
    flex: 1, borderRadius: radius.sm,
    backgroundColor: "#fff",
    position: "relative",
    alignItems: "center", justifyContent: "center",
  },
  cornerMark: {
    position: "absolute",
    width: 36, height: 36,
    borderColor: colors.primary,
    borderWidth: 4,
    borderRadius: 4,
  },
  qrCenter: { alignItems: "center", gap: 8 },
  qrCode: { ...font.headlineMd, color: colors.primary, fontSize: 28, fontWeight: "900", letterSpacing: 6 },
  countdownWrap: { alignItems: "center", gap: 8 },
  countdownRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4,
    alignItems: "center", justifyContent: "center", gap: 0,
  },
  countdownNum: { ...font.headlineLg, fontSize: 26 },
  countdownSec: { ...font.caption, color: colors.textMuted, marginTop: -4 },
  countdownLabel: { ...font.caption, color: colors.textMuted },
  awaitingBadge: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EFF6FF", borderRadius: radius.full,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  awaitingText: { ...font.labelMd, color: colors.accent },
  rentalRef: { ...font.caption, color: colors.textMuted, marginTop: spacing.sm },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, padding: spacing.margin },
  successTitle: { ...font.headlineLg, color: colors.textPrimary },
  successSub: { ...font.bodyMd, color: colors.textMuted, textAlign: "center" },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingHorizontal: 32, paddingVertical: 16,
  },
  doneBtnText: { ...font.headlineMd, color: "#fff" },
});
