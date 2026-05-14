import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChatCircle, QrCode } from "phosphor-react-native";
import { authClient } from "../../lib/auth";
import { Chip } from "../../components/ui/Chip";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const BASE_URL = "https://1l0oskvouaqvjjatva3n0-preview-4200.runable.site/";

export default function RentalsScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/rentals`, { credentials: "include" });
      return res.json();
    },
    enabled: !!session,
  });

  const rentals: any[] = (data as any)?.rentals ?? [];

  const statusVariant = (s: string): any =>
    ({ PENDING: "pending", ACTIVE: "active", COMPLETED: "completed", DISPUTED: "disputed" }[s] ?? "default");

  const renderItem = ({ item }: { item: any }) => {
    const isOwner = item.itemOwnerId === session?.user?.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.mediaWrap}>
            {item.itemMediaUrls?.[0] ? (
              <Image source={{ uri: item.itemMediaUrls[0] }} style={styles.media} />
            ) : (
              <View style={[styles.media, styles.mediaPlaceholder]}>
                <Text style={styles.mediaEmoji}>📦</Text>
              </View>
            )}
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.itemTitle} numberOfLines={2}>{item.itemTitle}</Text>
            <Chip label={item.status} variant={statusVariant(item.status)} />
            <Text style={styles.role}>{isOwner ? "You're lending" : "You're borrowing"}</Text>
            <Text style={styles.meta}>{item.totalDays} day{item.totalDays !== 1 ? "s" : ""} · ₹{(item.itemDailyRate * item.totalDays).toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/chat/${item.id}`)}
          >
            <ChatCircle size={18} color={colors.primary} />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>

          {item.status === "PENDING" && isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => router.push(`/handover/lender/${item.id}`)}
            >
              <QrCode size={18} color="#fff" />
              <Text style={[styles.actionText, { color: "#fff" }]}>Show QR</Text>
            </TouchableOpacity>
          )}

          {item.status === "PENDING" && !isOwner && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => router.push(`/handover/borrower/${item.id}`)}
            >
              <QrCode size={18} color="#fff" />
              <Text style={[styles.actionText, { color: "#fff" }]}>Scan QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rentals</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : rentals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔁</Text>
          <Text style={styles.emptyText}>No rentals yet</Text>
          <Text style={styles.emptySubtext}>Book an item to get started</Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.margin, paddingBottom: spacing.sm },
  title: { ...font.headlineLg, color: colors.textPrimary },
  list: { padding: spacing.margin, gap: spacing.sm, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.ambient,
  },
  cardTop: { flexDirection: "row", padding: spacing.md, gap: spacing.md },
  mediaWrap: { width: 80, height: 80, borderRadius: radius.sm, overflow: "hidden" },
  media: { width: 80, height: 80 },
  mediaPlaceholder: { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  mediaEmoji: { fontSize: 28 },
  cardBody: { flex: 1, gap: 4 },
  itemTitle: { ...font.labelMd, color: colors.textPrimary, fontSize: 15 },
  role: { ...font.caption, color: colors.textMuted },
  meta: { ...font.caption, color: colors.textSecondary, fontWeight: "600" },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 0,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border,
  },
  actionBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  actionText: { ...font.labelMd, color: colors.textPrimary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingText: { ...font.bodyMd, color: colors.textMuted },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...font.headlineMd, color: colors.textPrimary },
  emptySubtext: { ...font.bodyMd, color: colors.textMuted },
});
