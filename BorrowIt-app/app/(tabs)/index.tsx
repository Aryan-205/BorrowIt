import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, Animated, PanResponder, ScrollView,
  TextInput, Platform, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, SlidersHorizontal, X } from "phosphor-react-native";
import { apiFetch } from "../../lib/api";
import { ItemCard } from "../../components/ItemCard";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");

// Collapsed: just header (~100px). Expanded: ~half screen with horizontal list.
const SHEET_PEEK = 100;               // collapsed — header + grabber only
const SHEET_MAX  = SCREEN_H * 0.50;   // expanded — half screen
const MAP_HEIGHT = SCREEN_H - SHEET_PEEK; // map fills most of screen when collapsed

const DEMO_LAT = 19.076;
const DEMO_LNG = 72.8777;

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7c7c8a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#16213e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#0f3460" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1b2a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const CATEGORIES = ["All", "Electronics", "Tools", "Sports", "Outdoor", "Music", "Fashion", "Books", "Kitchen", "Other"];

let MapView: any = null;
let Marker: any = null;
try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
} catch {}

function PricePinMarker({ imageUrl, onPress }: { imageUrl?: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.pinWrapper} activeOpacity={0.85}>
      <View style={styles.pin}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.pinImage} />
        ) : (
          <View style={[styles.pinImage, styles.pinImageFallback]} />
        )}
      </View>
      <View style={styles.pinTail} />
    </TouchableOpacity>
  );
}

// Only items that have real, non-zero coordinates
function hasCoords(item: any): boolean {
  return (
    item.lat != null && item.lng != null &&
    item.lat !== 0 && item.lng !== 0 &&
    !isNaN(item.lat) && !isNaN(item.lng)
  );
}

function MapBackground({
  items,
  onPinPress,
  height,
}: {
  items: any[];
  onPinPress: (item: any) => void;
  height: number;
}) {
  if (!MapView || Platform.OS === "web") {
    // Web fallback — just a styled dark grid, no fake pins
    return (
      <View style={[styles.mapFallback, { height }]}>
        <View style={StyleSheet.absoluteFill}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h${i}`} style={[styles.mapRoad, { top: `${10 * (i + 1)}%` as any }]} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`v${i}`} style={[styles.mapRoadV, { left: `${12 * (i + 1)}%` as any }]} />
          ))}
        </View>
        <View style={styles.locationBadge}>
          <Text style={styles.locationText}>📍 Mumbai</Text>
        </View>
      </View>
    );
  }

  const mappableItems = items.filter(hasCoords);

  return (
    <View style={{ height }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: DEMO_LAT,
          longitude: DEMO_LNG,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        customMapStyle={DARK_MAP_STYLE}
        userInterfaceStyle="dark"
      >
        {mappableItems.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.lat, longitude: item.lng }}
            onPress={() => onPinPress(item)}
          >
            <PricePinMarker imageUrl={item.images?.[0]} onPress={() => onPinPress(item)} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

export default function DiscoverScreen() {
  const sheetY = useRef(new Animated.Value(0)).current;
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxRate, setMaxRate] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["items-near"],
    queryFn: async () => {
      const res = await apiFetch("api/items");
      if (!res.ok) throw new Error("Failed to load items");
      return res.json();
    },
    staleTime: 30_000,
  });

  const rawItems: any[] = (data as any)?.items ?? [];

  const items = useMemo(() => {
    let list = rawItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (it) =>
          it.title?.toLowerCase().includes(q) ||
          it.description?.toLowerCase().includes(q) ||
          it.ownerName?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "All") {
      list = list.filter((it) => it.category === selectedCategory);
    }
    if (maxRate.trim() && !isNaN(parseFloat(maxRate))) {
      const max = parseFloat(maxRate);
      list = list.filter((it) => it.dailyRate <= max);
    }
    return list;
  }, [rawItems, search, selectedCategory, maxRate]);

  const handlePinPress = useCallback(
    (item: any) => {
      Animated.spring(sheetY, {
        toValue: -(SHEET_MAX - SHEET_PEEK),
        useNativeDriver: false,
        stiffness: 200,
        damping: 24,
      }).start(() => setIsExpanded(true));
    },
    [sheetY]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderGrant: () => {
        sheetY.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dy: sheetY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        sheetY.flattenOffset();
        const goUp = gs.vy < -0.4 || gs.dy < -60;
        const goDown = gs.vy > 0.4 || gs.dy > 60;
        const target = goUp
          ? -(SHEET_MAX - SHEET_PEEK)
          : goDown
          ? 0
          : (sheetY as any)._value < -(SHEET_MAX - SHEET_PEEK) / 2
          ? -(SHEET_MAX - SHEET_PEEK)
          : 0;
        setIsExpanded(target < 0);
        Animated.spring(sheetY, {
          toValue: target,
          useNativeDriver: false,
          stiffness: 200,
          damping: 24,
        }).start();
      },
    })
  ).current;

  const sheetHeight = sheetY.interpolate({
    inputRange: [-(SHEET_MAX - SHEET_PEEK), 0],
    outputRange: [SHEET_MAX, SHEET_PEEK],
    extrapolate: "clamp",
  });

  const mapHeight = sheetY.interpolate({
    inputRange: [-(SHEET_MAX - SHEET_PEEK), 0],
    outputRange: [SCREEN_H - SHEET_MAX, MAP_HEIGHT],
    extrapolate: "clamp",
  });

  const clearSearch = () => {
    setSearch("");
    setSelectedCategory("All");
    setMaxRate("");
  };

  const hasFilters = search.trim() || selectedCategory !== "All" || maxRate.trim();

  const numColumns = isExpanded ? 2 : 1;

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1a2e" }}>
      {/* Map — shrinks as sheet expands. No overflow:hidden so pins aren't clipped */}
      <Animated.View style={{ height: mapHeight }}>
        <MapBackground items={rawItems} onPinPress={handlePinPress} height={MAP_HEIGHT} />
      </Animated.View>

      {/* Search bar — floats over map */}
      <SafeAreaView edges={["top"]} style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <MagnifyingGlass size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search items near you…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />
          {hasFilters ? (
            <TouchableOpacity onPress={clearSearch} hitSlop={8}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen((v) => !v)}>
              <SlidersHorizontal size={18} weight="bold" color={filterOpen ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {filterOpen && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterLabel}>Max daily rate (₹)</Text>
            <TextInput
              style={styles.filterInput}
              value={maxRate}
              onChangeText={setMaxRate}
              keyboardType="decimal-pad"
              placeholder="Any"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                >
                  <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        {/* Drag handle */}
        <View {...panResponder.panHandlers} style={styles.grabberWrap}>
          <View style={styles.grabber} />
        </View>

        <TouchableOpacity
          activeOpacity={isExpanded ? 1 : 0.7}
          onPress={() => {
            if (!isExpanded) {
              setIsExpanded(true);
              Animated.spring(sheetY, { toValue: -(SHEET_MAX - SHEET_PEEK), useNativeDriver: false, stiffness: 200, damping: 24 }).start();
            }
          }}
          style={styles.sheetHeader}
        >
          <View>
            <Text style={styles.sheetTitle}>Nearby Items</Text>
            <Text style={styles.sheetSubtitle}>
              {items.length} item{items.length !== 1 ? "s" : ""}
              {hasFilters ? " (filtered)" : " within 10km"}
            </Text>
          </View>
          {isExpanded ? (
            <TouchableOpacity
              style={styles.collapseBtn}
              onPress={() => {
                setIsExpanded(false);
                Animated.spring(sheetY, { toValue: 0, useNativeDriver: false, stiffness: 200, damping: 24 }).start();
              }}
            >
              <Text style={styles.collapseBtnText}>Map</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.expandHint}>
              <Text style={styles.expandHintText}>↑ Browse</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Only render content when expanded */}
        {isExpanded && (
          isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
            </ScrollView>
          ) : items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>{hasFilters ? "No matches" : "No items listed yet."}</Text>
              <Text style={styles.emptySubtext}>{hasFilters ? "Try different filters" : "Be the first to list something!"}</Text>
            </View>
          ) : (
            <FlatList
              key="horizontal"
              data={items}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => <ItemCard item={item} />}
            />
          )
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapFallback: {
    backgroundColor: "#1a1a2e",
    position: "relative",
  },
  mapRoad: {
    position: "absolute",
    left: 0, right: 0, height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  mapRoadV: {
    position: "absolute",
    top: 0, bottom: 0, width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  pinWrapper: {
    alignItems: "center",
  },
  pin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: "#fff",
    overflow: "hidden",
    backgroundColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  pinImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  pinImageFallback: {
    backgroundColor: "#555",
  },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#fff",
    marginTop: -1,
  },
  locationBadge: {
    position: "absolute",
    bottom: 12,
    left: spacing.margin,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationText: { ...font.caption, color: "#fff" },

  searchWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
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
    paddingVertical: 10,
    gap: 10,
    ...shadow.ambient,
  },
  searchInput: {
    flex: 1,
    ...font.bodyMd,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 32, height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  filterPanel: {
    marginHorizontal: spacing.margin,
    marginTop: -4,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    ...shadow.ambient,
    gap: 4,
  },
  filterLabel: { ...font.labelMd, color: colors.textSecondary },
  filterInput: {
    ...font.bodyMd,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: 4,
  },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { ...font.caption, fontWeight: "600", color: colors.textSecondary },
  catTextActive: { color: "#fff" },

  sheet: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    ...shadow.ambient,
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  grabberWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.margin,
    paddingBottom: spacing.sm,
  },
  sheetTitle: { ...font.headlineMd, color: colors.textPrimary },
  sheetSubtitle: { ...font.caption, color: colors.textMuted, marginTop: 2 },
  collapseBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  collapseBtnText: { ...font.caption, color: "#fff", fontWeight: "700" },
  expandHint: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expandHintText: { ...font.caption, color: colors.textSecondary, fontWeight: "600" },

  listContent: { paddingHorizontal: spacing.margin, paddingBottom: 24, gap: spacing.sm },

  gridContent: {
    paddingHorizontal: spacing.margin,
    paddingBottom: 100,
  },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  gridItem: { flex: 1, maxWidth: (SCREEN_W - spacing.margin * 2 - spacing.sm) / 2 },

  empty: { alignItems: "center", paddingTop: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...font.headlineMd, color: colors.textPrimary },
  emptySubtext: { ...font.bodyMd, color: colors.textMuted },
});
