import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { spacing } from "../../lib/theme";

const { width: W } = Dimensions.get("window");
const CARD_WIDTH = Math.round((W - spacing.margin * 2 - 14) / 2.12);

type OwnerItem = {
  id: string;
  title: string;
  dailyRate: number;
  mediaUrls: string[];
};

interface OwnerItemsCarouselProps {
  ownerName: string;
  items: OwnerItem[];
}

function ownerFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "this lender";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function OwnerItemsCarousel({ ownerName, items }: OwnerItemsCarouselProps) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Other items from {ownerFirstName(ownerName)}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const imageUri = item.mediaUrls?.[0];
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/item/${item.id}`)}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.placeholderEmoji}>📦</Text>
                </View>
              )}
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.price}>₹{item.dailyRate.toFixed(0)} / day</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    gap: 14,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    letterSpacing: -0.3,
  },
  scrollContent: {
    gap: 14,
    paddingRight: spacing.margin,
  },
  card: {
    width: CARD_WIDTH,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 36 },
  title: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    lineHeight: 18,
  },
  price: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
});
