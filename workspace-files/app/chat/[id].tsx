import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from "phosphor-react-native";
import { colors, font, spacing } from "../../lib/theme";

export default function ChatPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.body}>
        <Text style={styles.muted}>Rental</Text>
        <Text style={styles.id}>{id}</Text>
        <Text style={styles.hint}>Wire this screen to your chat API when the backend is running.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.sm,
  },
  title: { ...font.headlineMd, color: colors.textPrimary },
  body: { flex: 1, padding: spacing.margin, gap: spacing.sm },
  muted: { ...font.caption, color: colors.textMuted },
  id: { ...font.bodyMd, color: colors.textPrimary, fontWeight: "600" },
  hint: { ...font.bodyMd, color: colors.textSecondary, marginTop: spacing.md },
});
