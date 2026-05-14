import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, Animated, PanResponder, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, SlidersHorizontal } from "phosphor-react-native";
import { api } from "../../lib/api";
import { ItemCard } from "../../components/ItemCard";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");
const SHEET_MIN = SCREEN_H * 0.35;
const SHEET_MAX = SCREEN_H * 0.75;

// Demo location: Mumbai
const DEMO_LAT = 19.076;
const DEMO_LNG = 72.8777;

// Static dark map style background (using color blocks as map placeholder)
function MapBackground({ items }: { items: any[] }) {
  return (
    <View style={styles.mapBg}>
      {/* Dark map aesthetic */}
      <View style={styles.mapGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.mapRoad, { top: `${12 * (i + 1)}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={[styles.mapRoadV, { left: `${16 * (i + 1)}%` as any }]} />
        ))}
      </View>
      {/* Item pins */}
      {items.slice(0, 8).map((item, i) => {
        const x = 30 + (i * 67) % (SCREEN_W - 80);
        const y = 60 + (i * 53) % (SCREEN_H * 0.45 - 80);
        return (
          <View key={item.id} style={[styles.pin, { left: x, top: y }]}>
            <Text style={styles.pinText}>₹{item.dailyRate}</Text>
          </View>
        );
      })}
      {/* Location label */}
      <View style={styles.locationBadge}>
        <Text style={styles.locationText}>📍 Mumbai</Text>
      </View>
    </View>
  );
}

export default function DiscoverScreen() {
  const sheetY = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);

  const { data, isLoading } = useQuery({
    queryKey: ["items-near"],
    queryFn: async () => {
      const res = await (api as any).items.$get();
      return res.json();
    },
  });

  const items = (data as any)?.items ?? [];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastY.current = (sheetY as any)._value ?? 0;
        sheetY.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dy: sheetY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        sheetY.flattenOffset();
        const newY = lastY.current + gestureState.dy;
        const snapUp = gestureState.vy < -0.5 || gestureState.dy < -60;
        Animated.spring(sheetY, {
          toValue: snapUp ? -(SHEET_MAX - SHEET_MIN) : 0,
          useNativeDriver: false,
          stiffness: 200,
          damping: 24,
        }).start();
      },
    })
  ).current;

  const sheetHeight = sheetY.interpolate({
    inputRange: [-(SHEET_MAX - SHEET_MIN), 0],
    outputRange: [SHEET_MAX, SHEET_MIN],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Map */}
      <MapBackground items={items} />

      {/* Search bar */}
      <SafeAreaView edges={["top"]} style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search items near you…</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={18} weight="bold" color={colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Grabber */}
        <View {...panResponder.panHandlers} style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>

        <Text style={styles.sheetTitle}>Nearby Items</Text>
        <Text style={styles.sheetSubtitle}>{items.length} items within 10km</Text>

        {isLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
          </ScrollView>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No items listed yet.</Text>
            <Text style={styles.emptySubtext}>Be the first to list something!</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => <ItemCard item={item} />}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapBg: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    position: "relative",
    overflow: "hidden",
  },
  mapGrid: { ...StyleSheet.absoluteFillObject },
  mapRoad: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  mapRoadV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pin: {
    position: "absolute",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  pinText: { ...font.caption, color: "#fff", fontWeight: "700" },
  locationBadge: {
    position: "absolute",
    bottom: SHEET_MIN + 16,
    left: spacing.margin,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationText: { ...font.caption, color: "#fff" },
  searchWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchBar: {
    margin: spacing.margin,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: 10,
    ...shadow.ambient,
  },
  searchPlaceholder: { ...font.bodyMd, color: colors.textMuted, flex: 1 },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow.ambient,
    paddingBottom: 20,
  },
  grabberWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetTitle: { ...font.headlineMd, color: colors.textPrimary, marginLeft: spacing.margin, marginTop: 4 },
  sheetSubtitle: { ...font.caption, color: colors.textMuted, marginLeft: spacing.margin, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.margin, paddingBottom: 8 },
  empty: { alignItems: "center", paddingTop: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...font.headlineMd, color: colors.textPrimary },
  emptySubtext: { ...font.bodyMd, color: colors.textMuted },
});
