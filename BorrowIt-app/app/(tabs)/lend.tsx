import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Plus, X, ImageSquare, Minus } from "phosphor-react-native";
import { apiFetch } from "../../lib/api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

const CATEGORIES = ["Electronics", "Tools", "Sports", "Outdoor", "Music", "Fashion", "Books", "Kitchen", "Other"];
const MAX_SPECS = 6;

type SpecEntry = { label: string; value: string };

export default function LendScreen() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [dailyRate, setDailyRate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<SpecEntry[]>([{ label: "", value: "" }]);

  const addSpec = () => {
    if (specs.length < MAX_SPECS) setSpecs((prev) => [...prev, { label: "", value: "" }]);
  };

  const removeSpec = (i: number) => {
    setSpecs((prev) => prev.filter((_, j) => j !== i));
  };

  const updateSpec = (i: number, field: "label" | "value", text: string) => {
    setSpecs((prev) => prev.map((s, j) => (j === i ? { ...s, [field]: text } : s)));
  };

  const cleanSpecs = () => specs.filter((s) => s.label.trim() && s.value.trim());

  const createItem = useMutation({
    mutationFn: async () => {
      const res = await apiFetch("api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          category,
          dailyRate: parseFloat(dailyRate),
          securityDeposit: parseFloat(deposit),
          lat: 19.076 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1,
          mediaUrls: images,
          specs: cleanSpecs(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as any).message ?? "Failed to list item");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items-near"] });
      qc.invalidateQueries({ queryKey: ["my-items"] });
      Alert.alert("Listed!", "Your item is now live on the marketplace.", [{ text: "OK" }]);
      setTitle(""); setDescription(""); setDailyRate(""); setDeposit("");
      setImages([]); setSpecs([{ label: "", value: "" }]);
    },
    onError: (e: any) => Alert.alert("Error", e.message ?? "Failed to list item"),
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmit = () => {
    if (!title || !dailyRate || !deposit) return Alert.alert("Fill in title, daily rate, and deposit");
    if (isNaN(parseFloat(dailyRate)) || isNaN(parseFloat(deposit))) return Alert.alert("Rates must be numbers");
    createItem.mutate();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>List an Item</Text>
          <Text style={styles.subtitle}>Lend your stuff, earn daily.</Text>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
              {images.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X size={12} weight="bold" color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                <ImageSquare size={28} color={colors.textMuted} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Input label="Item Title" value={title} onChangeText={setTitle} placeholder="Sony Camera, Drill Kit…" />
          </View>
          <View style={styles.section}>
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Condition, included accessories…"
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: "top" } as any}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Daily Rate (₹)"
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType="decimal-pad"
                placeholder="150"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Security Deposit (₹)"
                value={deposit}
                onChangeText={setDeposit}
                keyboardType="decimal-pad"
                placeholder="500"
              />
            </View>
          </View>

          {/* Specs */}
          <View style={styles.section}>
            <View style={styles.specsHeader}>
              <View>
                <Text style={styles.sectionLabel}>Specs</Text>
                <Text style={styles.specsHint}>Up to 6 key facts (e.g. Battery: 8hrs)</Text>
              </View>
              {specs.length < MAX_SPECS && (
                <TouchableOpacity style={styles.addSpecBtn} onPress={addSpec}>
                  <Plus size={14} weight="bold" color={colors.primary} />
                  <Text style={styles.addSpecText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            {specs.map((spec, i) => (
              <View key={i} style={styles.specRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label=""
                    value={spec.label}
                    onChangeText={(t) => updateSpec(i, "label", t)}
                    placeholder="Label (e.g. Battery)"
                    style={styles.specInput as any}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label=""
                    value={spec.value}
                    onChangeText={(t) => updateSpec(i, "value", t)}
                    placeholder="Value (e.g. 8hrs)"
                    style={styles.specInput as any}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeSpecBtn}
                  onPress={() => removeSpec(i)}
                  hitSlop={8}
                >
                  <Minus size={14} weight="bold" color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Button
            label="List Item →"
            onPress={handleSubmit}
            loading={createItem.isPending}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.margin, gap: spacing.md, paddingBottom: 40 },
  title: { ...font.headlineLg, color: colors.textPrimary },
  subtitle: { ...font.bodyMd, color: colors.textMuted, marginTop: -8 },
  section: { gap: 8 },
  sectionLabel: { ...font.labelMd, color: colors.textSecondary },
  photoRow: { flexDirection: "row" as any },
  photoThumb: { width: 90, height: 90, borderRadius: radius.sm, marginRight: spacing.sm, position: "relative" },
  thumbImg: { width: 90, height: 90, borderRadius: radius.sm },
  removeBtn: {
    position: "absolute", top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center", justifyContent: "center",
  },
  addPhoto: {
    width: 90, height: 90, borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center", gap: 4,
  },
  addPhotoText: { ...font.caption, color: colors.textMuted },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { ...font.caption, fontWeight: "600", color: colors.textSecondary },
  catTextActive: { color: "#fff" },
  priceRow: { flexDirection: "row", gap: spacing.sm },
  specsHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  specsHint: { ...font.caption, color: colors.textMuted, marginTop: 2 },
  addSpecBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.primary,
  },
  addSpecText: { ...font.caption, color: colors.primary, fontWeight: "700" },
  specRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-end" },
  specInput: { paddingVertical: 8 },
  removeSpecBtn: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
});
