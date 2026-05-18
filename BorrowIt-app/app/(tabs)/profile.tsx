import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Share, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SignOut, CheckCircle } from "phosphor-react-native";
import { useSession, signOut } from "../../lib/auth";
import { BASE_URL } from "../../lib/api";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useSession();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/users/me`, { credentials: "include" });
      return res.json();
    },
    enabled: !!user,
  });

  const { data: itemsData, refetch: refetchItems } = useQuery({
    queryKey: ["my-items"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/items/my`, { credentials: "include" });
      return res.json();
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
  });

  const profile = (data as any)?.user;
  const myItems: any[] = (itemsData as any)?.items ?? [];

  const karmaScore = profile?.karma != null ? (profile.karma / 10).toFixed(2) : "5.00";
  const totalTrips = profile?.rentalCount ?? 0;
  const reliability = profile?.reliabilityPct ?? 100;
  const ownerInitial = (user?.username ?? user?.email ?? "?")[0]?.toUpperCase();
  const memberYear = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : new Date().getFullYear();

  const handleSignOut = async () => {
    await signOut();
    qc.clear();
    router.replace("/(auth)/login");
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out ${user?.username ?? "my"} profile on BorrowIt!` });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topAvatar}>
          <Text style={styles.topAvatarText}>{ownerInitial}</Text>
        </View>
        <Text style={styles.appTitle}>Borrow-It</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.notifBtn}>
          <SignOut size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View style={styles.heroSection}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ownerInitial}</Text>
            </View>
            {profile?.isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={18} weight="fill" color="#2563EB" />
              </View>
            )}
          </View>

          <Text style={styles.heroName}>{user?.username ?? "Loading…"}</Text>
          <Text style={styles.heroMeta}>Member since {memberYear}</Text>
        </View>

        {/* Trust & Karma card */}
        <View style={styles.karmaCard}>
          <Text style={styles.karmaSectionLabel}>TRUST & KARMA</Text>
          <View style={styles.karmaScoreRow}>
            <Text style={styles.karmaScore}>{karmaScore}</Text>
            <Text style={styles.karmaOutOf}> / 5.0</Text>
          </View>

          <View style={styles.karmaDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>{totalTrips}</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Reliability</Text>
              <Text style={styles.statValue}>{reliability}%</Text>
            </View>
          </View>
        </View>

        {/* My Listed Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>My Listings</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {myItems.length > 0 && (
                <Text style={styles.sectionCount}>{myItems.length} item{myItems.length !== 1 ? "s" : ""}</Text>
              )}
              <TouchableOpacity onPress={() => refetchItems()}>
                <Text style={styles.sectionViewAll}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
          {myItems.length === 0 ? (
            <View style={styles.vaultEmpty}>
              <Text style={styles.vaultEmptyText}>No listings yet. Tap List to add one!</Text>
            </View>
          ) : (
            <View style={styles.listingGrid}>
              {myItems.map((item) => {
                const thumb = item.mediaUrls?.[0];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.listingCard}
                    onPress={() => router.push(`/item/${item.id}`)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.listingThumb}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.listingThumbImg} resizeMode="cover" />
                      ) : (
                        <View style={[styles.listingThumbImg, styles.listingThumbPlaceholder]}>
                          <Text style={{ fontSize: 24 }}>📦</Text>
                        </View>
                      )}
                      <View style={[styles.listingAvailDot, { backgroundColor: item.isAvailable ? "#22C55E" : "#EF4444" }]} />
                    </View>
                    <View style={styles.listingBody}>
                      <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.listingRate}>₹{item.dailyRate}/day</Text>
                      <Text style={[styles.listingStatus, { color: item.isAvailable ? "#22C55E" : "#EF4444" }]}>
                        {item.isAvailable ? "Available" : "Lent out"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Share Profile */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.88}>
          <Text style={styles.shareBtnText}>Share Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.margin,
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
  },
  topAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  topAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  appTitle: { ...font.headlineMd, color: colors.textPrimary, fontSize: 18 },
  notifBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },

  container: { paddingHorizontal: spacing.margin, paddingBottom: 48, gap: spacing.lg },

  heroSection: { alignItems: "center", paddingTop: spacing.md, gap: 6 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "700" },
  verifiedBadge: {
    position: "absolute", bottom: 2, right: 2,
    backgroundColor: "#fff", borderRadius: 12, padding: 1,
  },
  heroName: {
    fontSize: 24, fontWeight: "700", color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroMeta: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  signOutLink: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 4, paddingVertical: 4,
  },
  signOutText: { fontSize: 12, color: colors.textMuted },

  karmaCard: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    gap: 4,
    ...shadow.ambient,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  karmaSectionLabel: {
    fontSize: 11, fontWeight: "700",
    color: colors.textMuted, letterSpacing: 1.5,
    marginBottom: 4,
  },
  karmaScoreRow: { flexDirection: "row", alignItems: "baseline" },
  karmaScore: {
    fontSize: 52, fontWeight: "800",
    color: colors.textPrimary, letterSpacing: -2,
  },
  karmaOutOf: {
    fontSize: 20, fontWeight: "500",
    color: colors.textMuted, marginBottom: 6,
  },
  karmaDivider: { width: "100%", height: 1, backgroundColor: "#F0F0F0", marginVertical: 8 },
  statsRow: { flexDirection: "row", width: "100%", justifyContent: "center", gap: spacing.xl },
  statSep: { width: 1, height: "100%", backgroundColor: "#F0F0F0" },
  statBlock: { alignItems: "center", gap: 2, flex: 1 },
  statLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  statValue: { fontSize: 28, fontWeight: "700", color: colors.textPrimary, letterSpacing: -0.5 },

  section: { gap: spacing.sm },
  sectionHeaderRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, letterSpacing: -0.3 },
  sectionViewAll: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },
  sectionCount: { fontSize: 13, color: colors.textMuted, fontWeight: "500" },

  vaultEmpty: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1, borderColor: "#EFEFEF",
    padding: spacing.xl,
    alignItems: "center", gap: spacing.sm,
  },
  vaultEmptyText: { fontSize: 14, color: colors.textMuted },

  vaultList: { backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: "#EFEFEF", overflow: "hidden" },
  vaultCard: {
    flexDirection: "row", alignItems: "center",
    padding: spacing.md, gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  vaultThumb: { width: 60, height: 60, borderRadius: radius.sm, overflow: "hidden", position: "relative" },
  vaultThumbImg: { width: 60, height: 60 },
  vaultThumbPlaceholder: { backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
  playBadge: {
    position: "absolute", bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center",
  },
  vaultInfo: { flex: 1, gap: 3 },
  vaultItemTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  vaultLabel: { fontSize: 12, color: colors.textMuted },
  vaultConditionRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  vaultCondition: { fontSize: 12, color: "#22C55E", fontWeight: "500" },
  vaultChevron: { paddingLeft: 4 },

  // Listings grid
  listingGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.sm,
  },
  listingCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1, borderColor: "#EFEFEF",
    overflow: "hidden",
    ...shadow.ambient,
  },
  listingThumb: { height: 110, position: "relative" },
  listingThumbImg: { width: "100%", height: "100%" },
  listingThumbPlaceholder: { backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },
  listingAvailDot: {
    position: "absolute", top: 8, right: 8,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: "#fff",
  },
  listingBody: { padding: 10, gap: 2 },
  listingTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  listingRate: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  listingStatus: { fontSize: 11, fontWeight: "600" },

  shareBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
  },
  shareBtnText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.2 },
});
