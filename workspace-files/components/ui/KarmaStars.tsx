import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Star } from "phosphor-react-native";
import { colors, font } from "../../lib/theme";

interface KarmaStarsProps {
  score: number;
  count?: number;
  size?: number;
}

export function KarmaStars({ score, count, size = 14 }: KarmaStarsProps) {
  return (
    <View style={styles.row}>
      <Star size={size} weight="fill" color="#F59E0B" />
      <Text style={[styles.score, { fontSize: size }]}>{score.toFixed(1)}</Text>
      {count !== undefined && <Text style={[styles.count, { fontSize: size - 1 }]}>({count})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 3 },
  score: { ...font.labelMd, color: colors.textPrimary },
  count: { ...font.caption, color: colors.textMuted },
});
