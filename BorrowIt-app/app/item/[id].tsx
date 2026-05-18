import React, { useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, ShieldCheck, CalendarBlank } from "phosphor-react-native";
import { Chip } from "../../components/ui/Chip";
import { KarmaStars } from "../../components/ui/KarmaStars";
import { Button } from "../../components/ui/Button";
import { useSession } from "../../lib/auth";
import { BASE_URL } from "../../lib/api";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const { width: W } = Dimensions.get("window");

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useSession();
  const [days, setDays] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/items/${id}`);
      return res.json();
    },
  });

  const book = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}api/rentals/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: id, totalDays: days }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message ?? "Booking failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items-near"] });
      qc.invalidateQueries({ queryKey: ["my-rentals"] });
      Alert.alert(
        "Booked!",
        "Your rental request is pending. The lender will generate a QR code when ready.",
        [{ text: "View Rentals", onPress: () => router.push("/(tabs)/rentals") }]
      );
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const item = (data as any)?.item;

  if (isLoading || !item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.loadWrap}>
          <Text style={styles.loadText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const total = item.dailyRate * days;
  const isOwner = item.ownerId === user?.id;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Image carousel */}
        <View style={styles.imageWrap}>
          {item.mediaUrls?.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={item.mediaUrls}
              keyExtractor={(_: any, i: number) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={item.mediaUrls.length > 1}
              onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / W);
                setImgIdx(idx);
              }}
              renderItem={({ item: uri }: { item: string }) => (
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              )}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderEmoji}>📦</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} weight="bold" color="#fff" />
          </TouchableOpacity>
          {item.mediaUrls?.length > 1 && (
            <View style={styles.dots}>
              {item.mediaUrls.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === imgIdx && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Chip label={item.category} />
            <Chip label={item.isAvailable ? "Available" : "Unavailable"} variant={item.isAvailable ? "available" : "pending"} />
          </View>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.dailyRate}</Text>
            <Text style={styles.priceUnit}>/day</Text>
          </View>

          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

          {/* Owner */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{item.ownerName?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{item.ownerName ?? "Owner"}</Text>
              <KarmaStars score={item.ownerKarma ?? 5} count={item.ownerKarmaCount ?? 0} />
            </View>
            {item.ownerIsVerified && <ShieldCheck size={20} weight="fill" color={colors.accent} />}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>
              {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}
            </Text>
          </View>

          {/* Specs */}
          {item.specs?.length > 0 && (
            <View style={styles.specsSection}>
              <Text style={styles.specsTitle}>Specs</Text>
              <View style={styles.specsGrid}>
                {item.specs.map((spec: { label: string; value: string }, i: number) => (
                  <View key={i} style={styles.specChip}>
                    <Text style={styles.specLabel}>{spec.label}</Text>
                    <Text style={styles.specValue}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Deposit info */}
          <View style={styles.depositCard}>
            <ShieldCheck size={20} color={colors.accent} weight="fill" />
            <Text style={styles.depositText}>
              ₹{item.securityDeposit} refundable security deposit
            </Text>
          </View>
        </View>

        {/* Booking */}
        <View style={styles.bookCard}>
          <Text style={styles.bookTitle}>{isOwner ? "Your Listing" : "Book This Item"}</Text>
          <View style={styles.daySelector}>
            <TouchableOpacity
              style={styles.dayBtn}
              onPress={() => setDays((d) => Math.max(1, d - 1))}
              disabled={isOwner}
            >
              <Text style={styles.dayBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.dayDisplay}>
              <CalendarBlank size={16} color={colors.textSecondary} />
              <Text style={styles.dayCount}>{days} day{days !== 1 ? "s" : ""}</Text>
            </View>
            <TouchableOpacity style={styles.dayBtn} onPress={() => setDays((d) => d + 1)} disabled={isOwner}>
              <Text style={styles.dayBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Rental total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Deposit (refundable)</Text>
            <Text style={styles.totalValue}>₹{item.securityDeposit.toFixed(0)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandRow]}>
            <Text style={styles.grandLabel}>Total due</Text>
            <Text style={styles.grandValue}>₹{(total + item.securityDeposit).toFixed(0)}</Text>
          </View>

          <Button
            label={
              isOwner
                ? "This is your listing"
                : !item.isAvailable
                ? "Currently unavailable"
                : `Book for ₹${(total + item.securityDeposit).toFixed(0)} →`
            }
            onPress={() => { if (!isOwner && item.isAvailable) book.mutate(); }}
            loading={book.isPending}
            style={{ marginTop: spacing.sm, opacity: (isOwner || !item.isAvailable) ? 0.5 : 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { paddingBottom: 48 },
  loadWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadText: { ...font.bodyMd, color: colors.textMuted },
  imageWrap: { position: "relative", height: 300 },
  image: { width: W, height: 300 },
  imagePlaceholder: { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
  imagePlaceholderEmoji: { fontSize: 64 },
  backBtn: {
    position: "absolute", top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  dots: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 16 },
  info: { padding: spacing.margin, gap: spacing.md },
  topRow: { flexDirection: "row", gap: 8 },
  title: { ...font.headlineLg, color: colors.textPrimary },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  price: { ...font.display, color: colors.primary, fontSize: 32 },
  priceUnit: { ...font.bodyLg, color: colors.textMuted },
  description: { ...font.bodyMd, color: colors.textSecondary, lineHeight: 22 },
  ownerCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md,
  },
  ownerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  ownerAvatarText: { color: "#fff", ...font.headlineMd, fontSize: 18 },
  ownerName: { ...font.labelMd, color: colors.textPrimary },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { ...font.caption, color: colors.textMuted },
  specsSection: { gap: 8 },
  specsTitle: { ...font.labelMd, color: colors.textSecondary },
  specsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specChip: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 12, paddingVertical: 8,
    minWidth: 80,
  },
  specLabel: { ...font.caption, color: colors.textMuted, marginBottom: 2 },
  specValue: { ...font.labelMd, color: colors.textPrimary, fontSize: 13 },
  depositCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#EFF6FF", borderRadius: radius.sm, padding: spacing.md,
  },
  depositText: { ...font.labelMd, color: colors.accent, flex: 1 },
  bookCard: {
    margin: spacing.margin, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    gap: spacing.sm, ...shadow.ambient,
  },
  bookTitle: { ...font.headlineMd, color: colors.textPrimary },
  daySelector: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dayBtn: {
    width: 40, height: 40, borderRadius: radius.sm,
    backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.border,
  },
  dayBtnText: { ...font.headlineMd, fontSize: 20, color: colors.textPrimary },
  dayDisplay: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dayCount: { ...font.labelMd, color: colors.textPrimary, fontSize: 16 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { ...font.bodyMd, color: colors.textSecondary },
  totalValue: { ...font.labelMd, color: colors.textPrimary },
  grandRow: { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs },
  grandLabel: { ...font.headlineMd, color: colors.textPrimary },
  grandValue: { ...font.headlineMd, color: colors.primary },
  ownerNote: {
    margin: spacing.margin, padding: spacing.md,
    backgroundColor: colors.background, borderRadius: radius.md, alignItems: "center",
  },
  ownerNoteText: { ...font.labelMd, color: colors.textMuted },
});
