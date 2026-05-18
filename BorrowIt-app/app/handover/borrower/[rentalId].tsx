import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle } from "phosphor-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Alert } from "../../../components/ui/Alert";
import { apiFetch } from "../../../lib/api";
import { colors, font, spacing, radius } from "../../../lib/theme";

export default function BorrowerHandoverScreen() {
  const { rentalId } = useLocalSearchParams<{ rentalId: string }>();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [verified, setVerified] = useState(false);

  const scanQR = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiFetch(`api/rentals/${rentalId}/scan-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as any).message ?? "QR scan failed");
      return data;
    },
    onSuccess: () => setVerified(true),
    onError: (e: any) => {
      Alert.alert("Invalid QR", e.message ?? "Could not verify handover.", [
        { text: "Try Again", onPress: () => setScanned(false) },
      ]);
    },
  });

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || scanQR.isPending) return;
    setScanned(true);
    scanQR.mutate(data);
  };

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  if (verified) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.successWrap}>
          <CheckCircle size={80} weight="fill" color="#22C55E" />
          <Text style={styles.successTitle}>Handover Confirmed!</Text>
          <Text style={styles.successSub}>Item received. Your rental is now active.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push("/(tabs)/rentals")}>
            <Text style={styles.doneBtnText}>View Rentals →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} weight="bold" color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.permTitle}>Camera Permission Required</Text>
          <Text style={styles.permSub}>We need camera access to scan the lender's QR code.</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} weight="bold" color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Scan the Lender's QR</Text>
        <Text style={styles.subtitle}>Point your camera at the QR shown on the lender's screen to confirm pickup.</Text>

        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          {/* Overlay corners */}
          <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
          <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
        </View>

        {scanQR.isPending && (
          <View style={styles.verifyingBadge}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.verifyingText}>Verifying…</Text>
          </View>
        )}

        {scanned && !scanQR.isPending && !verified && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => setScanned(false)}>
            <Text style={styles.retryText}>Scan Again</Text>
          </TouchableOpacity>
        )}

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
  cameraWrap: {
    width: 260, height: 260, borderRadius: radius.md,
    overflow: "hidden", position: "relative",
    borderWidth: 1, borderColor: colors.border,
  },
  camera: { width: "100%", height: "100%" },
  corner: {
    position: "absolute", width: 24, height: 24,
    borderColor: colors.primary,
  },
  verifyingBadge: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EFF6FF", borderRadius: radius.full,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  verifyingText: { ...font.labelMd, color: colors.accent },
  retryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  retryText: { ...font.labelMd, color: "#fff" },
  rentalRef: { ...font.caption, color: colors.textMuted, marginTop: spacing.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.margin },
  permTitle: { ...font.headlineMd, color: colors.textPrimary, textAlign: "center" },
  permSub: { ...font.bodyMd, color: colors.textMuted, textAlign: "center" },
  permBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingHorizontal: 28, paddingVertical: 14,
  },
  permBtnText: { ...font.labelMd, color: "#fff" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, padding: spacing.margin },
  successTitle: { ...font.headlineLg, color: colors.textPrimary },
  successSub: { ...font.bodyMd, color: colors.textMuted, textAlign: "center" },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: radius.sm,
    paddingHorizontal: 32, paddingVertical: 16,
  },
  doneBtnText: { ...font.headlineMd, color: "#fff" },
});
