import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Star, CurrencyInr } from "phosphor-react-native";
import { colors, radius, spacing, font, shadow } from "../lib/theme";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    dailyRate: number;
    securityDeposit?: number;
    mediaUrls: string[];
    isAvailable: boolean;
    ownerName?: string | null;
    ownerKarma?: number | null;
    lat?: number;
    lng?: number;
    city?: string;
    distance?: number;
  };
  compact?: boolean;
  gridMode?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#3B82F6",
  Tools: "#F59E0B",
  Sports: "#10B981",
  Outdoor: "#6366F1",
  Music: "#EC4899",
  Fashion: "#8B5CF6",
  Books: "#14B8A6",
  Kitchen: "#F97316",
  Other: "#6B7280",
};

export function ItemCard({ item, compact, gridMode }: ItemCardProps) {
  const router = useRouter();
  const imageUri = item.mediaUrls?.[0];
  const catColor = CATEGORY_COLORS[item.category ?? ""] ?? "#6B7280";
  const showCategory = item.category && item.category !== "Other";
  const karmaScore = item.ownerKarma != null ? (item.ownerKarma ?? 0).toFixed(1) : null;
  const rawName = item.ownerName ?? "";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const ownerInitial = rawName[0]?.toUpperCase() ?? "?";

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/item/${item.id}`)}
        activeOpacity={0.88}
        style={styles.compactCard}
      >
        <View style={styles.compactImageWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.compactImage} resizeMode="cover" />
          ) : (
            <View style={[styles.compactImage, styles.imagePlaceholder]}>
              <Text style={styles.emoji}>📦</Text>
            </View>
          )}
          <View style={[styles.availDot, { backgroundColor: item.isAvailable ? "#22C55E" : "#EF4444" }]} />
        </View>
        <View style={styles.compactBody}>
          <Text style={styles.compactTitle} numberOfLines={1}>{item.title}</Text>
          {showCategory && (
            <Text style={[styles.compactCat, { color: catColor }]}>{item.category}</Text>
          )}
          <View style={styles.compactRateRow}>
            <Text style={styles.compactRate}>₹{item.dailyRate.toFixed(0)}</Text>
            <Text style={styles.compactRateUnit}>/day</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.88}
      style={[styles.card, gridMode && styles.cardGrid]}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.emoji}>📦</Text>
          </View>
        )}

        {/* Category badge top-left — only if not "Other" */}
        {showCategory && (
          <View style={[styles.catBadge, { backgroundColor: catColor }]}>
            <Text style={styles.catBadgeText}>{item.category}</Text>
          </View>
        )}

        {/* Availability dot top-right */}
        <View style={styles.availBadge}>
          <View style={[styles.availDot, { backgroundColor: item.isAvailable ? "#22C55E" : "#EF4444" }]} />
          <Text style={styles.availText}>{item.isAvailable ? "Available" : "Lent out"}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

        {item.description ? (
          <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        ) : null}

        {/* Rate + Deposit */}
        <View style={styles.priceRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.rate}>₹{item.dailyRate.toFixed(0)}</Text>
            <Text style={styles.rateUnit}>/day</Text>
          </View>
          {item.securityDeposit ? (
            <View style={styles.depositPill}>
              <CurrencyInr size={10} color="#6B7280" weight="bold" />
              <Text style={styles.depositText}>{item.securityDeposit} deposit</Text>
            </View>
          ) : null}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Owner + Location */}
        <View style={styles.footer}>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitial}>{ownerInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName} numberOfLines={1}>{displayName || "Owner"}</Text>
              {karmaScore && (
                <View style={styles.ratingRow}>
                  <Star size={10} weight="fill" color="#F59E0B" />
                  <Text style={styles.ratingText}>{karmaScore}</Text>
                </View>
              )}
            </View>
          </View>

          {(item.city || item.distance != null) ? (
            <View style={styles.locationRow}>
              <MapPin size={11} color="#6B7280" weight="fill" />
              <Text style={styles.locationText}>
                {item.distance != null ? `${item.distance.toFixed(1)} km` : item.city}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: "hidden",
    width: 200,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.ambient,
  },
  cardGrid: {
    width: "100%",
    flexShrink: 1,
  },
  imageWrap: { height: 130, position: "relative" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 36 },

  catBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  availBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  availDot: { width: 7, height: 7, borderRadius: 4 },
  availText: { fontSize: 10, fontWeight: "600", color: "#fff" },

  body: { padding: 12, gap: 5 },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 17,
  },
  desc: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  priceBlock: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  rate: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  rateUnit: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  depositPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  depositText: { fontSize: 10, color: "#6B7280", fontWeight: "500" },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ownerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerInitial: { fontSize: 10, fontWeight: "700", color: "#fff" },
  ownerName: { fontSize: 11, fontWeight: "600", color: colors.textSecondary, maxWidth: 80 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 10, color: "#F59E0B", fontWeight: "600" },

  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 10, color: colors.textMuted, fontWeight: "500" },

  // Compact variant
  compactCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: spacing.sm,
    ...shadow.ambient,
  },
  compactImageWrap: { width: 80, height: 80, position: "relative" },
  compactImage: { width: 80, height: 80 },
  compactBody: { flex: 1, padding: 10, justifyContent: "center", gap: 2 },
  compactTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  compactCat: { fontSize: 10, fontWeight: "600" },
  compactRateRow: { flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 2 },
  compactRate: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  compactRateUnit: { fontSize: 10, color: colors.textMuted },
});
