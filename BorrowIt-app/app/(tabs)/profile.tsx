import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SignOut, CheckCircle, Video, Star } from "phosphor-react-native";
import { authClient } from "../../lib/auth";
import { KarmaStars } from "../../components/ui/KarmaStars";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const BASE_URL = "https://1l0oskvouaqvjjatva3n0-preview-4200.runable.site/";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/users/me`, { credentials: "include" });
      return res.json();
    },
    enabled: !!session,
  });

  const { data: rentalsData } = useQuery({
    queryKey: ["my-rentals-profile"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/rentals`, { credentials: "include" });
      return res.json();
    },
    enabled: !!session,
  });

  const user = (data as any)?.user;
  const rentals: any[] = (rentalsData as any)?.rentals ?? [];
  const evidenceRentals = rentals.filter((r) => r.pickupVideoUrl || r.returnVideoUrl);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{session?.user?.name?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{session?.user?.name ?? "Loading…"}</Text>
              {user?.isVerified && <CheckCircle size={18} weight="fill" color={colors.accent} />}
            </View>
            <Text style={styles.email}>{session?.user?.email}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <SignOut size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Karma Card */}
        <View style={styles.karmaCard}>
          <View style={styles.karmaMain}>
            <Text style={styles.karmaScore}>{user?.karmaScore?.toFixed(1) ?? "5.0"}</Text>
            <Star size={28} weight="fill" color="#F59E0B" />
          </View>
          <Text style={styles.karmaLabel}>Karma Score</Text>
          <Text style={styles.karmaCount}>{user?.karmaCount ?? 0} reviews</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.rentalCount ?? 0}</Text>
            <Text style={styles.statLabel}>Total Rentals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.completedRentals ?? 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.reliabilityPct ?? 100}%</Text>
            <Text style={styles.statLabel}>Reliability</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.itemCount ?? 0}</Text>
            <Text style={styles.statLabel}>Items Listed</Text>
          </View>
        </View>

        {/* Evidence Vault */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Vault</Text>
          <Text style={styles.sectionSubtitle}>Inspection videos from your rentals</Text>
          {evidenceRentals.length === 0 ? (
            <View style={styles.vaultEmpty}>
              <Video size={32} color={colors.textMuted} />
              <Text style={styles.vaultEmptyText}>No inspection videos yet</Text>
            </View>
          ) : (
            evidenceRentals.map((r) => (
              <View key={r.id} style={styles.evidenceCard}>
                <View style={styles.evidenceIcon}>
                  <Video size={24} color={colors.primary} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.evidenceTitle} numberOfLines={1}>{r.itemTitle}</Text>
                  <Text style={styles.evidenceMeta}>
                    {r.pickupVideoUrl ? "✓ Pickup" : ""}{r.pickupVideoUrl && r.returnVideoUrl ? "  " : ""}
                    {r.returnVideoUrl ? "✓ Return" : ""}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.margin, gap: spacing.lg, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadow.ambient,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", ...font.headlineMd, fontSize: 22 },
  headerText: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { ...font.headlineMd, color: colors.textPrimary },
  email: { ...font.caption, color: colors.textMuted },
  signOutBtn: { padding: 8 },
  karmaCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  karmaMain: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  karmaScore: { ...font.display, color: "#fff", fontSize: 52 },
  karmaLabel: { ...font.headlineMd, color: "rgba(255,255,255,0.7)" },
  karmaCount: { ...font.caption, color: "rgba(255,255,255,0.5)" },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statCard: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    alignItems: "center", gap: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { ...font.headlineMd, color: colors.textPrimary },
  statLabel: { ...font.caption, color: colors.textMuted, textAlign: "center" },
  section: { gap: spacing.sm },
  sectionTitle: { ...font.headlineMd, color: colors.textPrimary },
  sectionSubtitle: { ...font.caption, color: colors.textMuted },
  vaultEmpty: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.xl, alignItems: "center", gap: spacing.sm,
  },
  vaultEmptyText: { ...font.bodyMd, color: colors.textMuted },
  evidenceCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md,
  },
  evidenceIcon: {
    width: 44, height: 44, borderRadius: radius.sm,
    backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
  },
  evidenceTitle: { ...font.labelMd, color: colors.textPrimary },
  evidenceMeta: { ...font.caption, color: colors.success ?? colors.textMuted },
});
