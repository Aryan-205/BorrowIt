import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MapPin } from "phosphor-react-native";
import { colors, radius, spacing, font, shadow } from "../lib/theme";
import { KarmaStars } from "./ui/KarmaStars";
import { Chip } from "./ui/Chip";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    dailyRate: number;
    securityDeposit: number;
    mediaUrls: string[];
    isAvailable: boolean;
    ownerName?: string | null;
    ownerKarma?: number | null;
    lat: number;
    lng: number;
  };
  compact?: boolean;
}

export function ItemCard({ item, compact }: ItemCardProps) {
  const router = useRouter();
  const imageUri = item.mediaUrls?.[0];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/item/${item.id}`)}
      activeOpacity={0.9}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.emoji}>📦</Text>
          </View>
        )}
        <View style={styles.chipOverlay}>
          <Chip label={item.isAvailable ? "Available" : "Lent"} variant={item.isAvailable ? "available" : "pending"} />
        </View>
      </View>
      <View style={[styles.body, compact && styles.bodyCompact]}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.row}>
          <Text style={styles.rate}>₹{item.dailyRate.toFixed(0)}</Text>
          <Text style={styles.rateUnit}>/day</Text>
        </View>
        {item.ownerName && (
          <View style={styles.owner}>
            <Text style={styles.ownerName}>{item.ownerName}</Text>
            {item.ownerKarma != null && <KarmaStars score={item.ownerKarma} size={12} />}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    width: 220,
    marginRight: spacing.md,
    ...shadow.ambient,
  },
  cardCompact: { width: "100%", flexDirection: "row", marginRight: 0, marginBottom: spacing.sm },
  imageWrap: { height: 140, position: "relative" },
  imageWrapCompact: { height: 90, width: 110 },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 32 },
  chipOverlay: { position: "absolute", top: 8, left: 8 },
  body: { padding: spacing.md, gap: 4 },
  bodyCompact: { flex: 1, paddingLeft: spacing.md },
  title: { ...font.labelMd, fontSize: 14, color: colors.textPrimary },
  row: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  rate: { ...font.headlineMd, fontSize: 18, color: colors.primary },
  rateUnit: { ...font.caption, color: colors.textMuted },
  owner: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  ownerName: { ...font.caption, color: colors.textSecondary },
});
