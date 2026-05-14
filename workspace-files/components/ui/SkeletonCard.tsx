import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../lib/theme";

export function SkeletonCard() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bg = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, colors.border],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { backgroundColor: bg }]} />
      <View style={styles.body}>
        <Animated.View style={[styles.line, { width: "70%", backgroundColor: bg }]} />
        <Animated.View style={[styles.line, { width: "40%", backgroundColor: bg }]} />
        <Animated.View style={[styles.line, { width: "55%", backgroundColor: bg }]} />
      </View>
    </View>
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
  },
  image: { height: 140, width: "100%" },
  body: { padding: spacing.md, gap: 8 },
  line: { height: 12, borderRadius: radius.sm },
});
