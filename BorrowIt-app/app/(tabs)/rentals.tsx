import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChatCircle, QrCode, CheckCircle, WarningCircle, FileText, X, CalendarBlank, ShieldCheck, Receipt } from "phosphor-react-native";
import { useSession } from "../../lib/auth";
import { apiFetch } from "../../lib/api";
import { Alert } from "../../components/ui/Alert";
import { Chip } from "../../components/ui/Chip";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";

function RentalAgreementModal({ rental, visible, onClose }: { rental: any; visible: boolean; onClose: () => void }) {
  if (!rental) return null;
  const totalRent = rental.itemDailyRate * rental.totalDays;
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.header}>
            <Text style={modal.title}>Rental Agreement</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={modal.body} showsVerticalScrollIndicator={false}>
            <Text style={modal.agreementTitle}>ITEM RENTAL AGREEMENT</Text>
            <Text style={modal.agreementSub}>Agreement ID: {rental.id?.slice(0, 8).toUpperCase()}</Text>
            <Text style={modal.agreementDate}>Date: {today}</Text>

            <View style={modal.divider} />

            <Text style={modal.sectionHead}>PARTIES</Text>
            <View style={modal.row}>
              <View style={modal.party}>
                <Text style={modal.partyRole}>LENDER</Text>
                <Text style={modal.partyName}>{rental.lenderName}</Text>
              </View>
              <View style={modal.partyDivider} />
              <View style={modal.party}>
                <Text style={modal.partyRole}>BORROWER</Text>
                <Text style={modal.partyName}>{rental.borrowerName}</Text>
              </View>
            </View>

            <View style={modal.divider} />

            <Text style={modal.sectionHead}>ITEM</Text>
            <Text style={modal.itemName}>{rental.itemTitle}</Text>
            <Text style={modal.itemId}>Item ID: {rental.itemId?.slice(0, 8).toUpperCase()}</Text>

            <View style={modal.divider} />

            <Text style={modal.sectionHead}>TERMS</Text>
            <View style={modal.termRow}>
              <Text style={modal.termLabel}>Rental Duration</Text>
              <Text style={modal.termValue}>{rental.totalDays} day{rental.totalDays !== 1 ? "s" : ""}</Text>
            </View>
            <View style={modal.termRow}>
              <Text style={modal.termLabel}>Daily Rate</Text>
              <Text style={modal.termValue}>₹{rental.itemDailyRate}/day</Text>
            </View>
            <View style={modal.termRow}>
              <Text style={modal.termLabel}>Total Rental Cost</Text>
              <Text style={modal.termValue}>₹{totalRent}</Text>
            </View>
            <View style={modal.termRow}>
              <Text style={modal.termLabel}>Status</Text>
              <Text style={[modal.termValue, { color: colors.primary }]}>{rental.status}</Text>
            </View>

            <View style={modal.divider} />

            <Text style={modal.sectionHead}>CONDITIONS</Text>
            <Text style={modal.clause}>1. The borrower agrees to return the item in the same condition as received.</Text>
            <Text style={modal.clause}>2. Any damage beyond normal wear shall be compensated by the borrower.</Text>
            <Text style={modal.clause}>3. Handover shall be confirmed via QR code scan by both parties.</Text>
            <Text style={modal.clause}>4. Disputes shall be raised within 24 hours of item return.</Text>
            <Text style={modal.clause}>5. BorrowIt platform serves as escrow for the security deposit.</Text>

            <View style={modal.divider} />

            <View style={modal.signatureRow}>
              <View style={modal.sigBlock}>
                <View style={modal.sigLine} />
                <Text style={modal.sigName}>{rental.lenderName}</Text>
                <Text style={modal.sigRole}>Lender</Text>
              </View>
              <View style={modal.sigBlock}>
                <View style={modal.sigLine} />
                <Text style={modal.sigName}>{rental.borrowerName}</Text>
                <Text style={modal.sigRole}>Borrower</Text>
              </View>
            </View>

            <Text style={modal.footer}>This agreement is digitally acknowledged upon QR handover confirmation via the BorrowIt platform.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function RentalsScreen() {
  const router = useRouter();
  const { user } = useSession();
  const qc = useQueryClient();
  const [agreementRental, setAgreementRental] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "past">("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-rentals"],
    queryFn: async () => {
      const res = await apiFetch("api/rentals");
      return res.json();
    },
    enabled: !!user,
  });

  // FIX: backend expects { action } not { status }
  const updateStatus = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const res = await apiFetch(`api/rentals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error((d as any).message ?? "Failed");
      return d;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-rentals"] }),
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const rentals: any[] = (data as any)?.rentals ?? [];

  const filteredRentals = rentals.filter((r) => {
    if (activeTab === "active") return r.status === "PENDING" || r.status === "APPROVED";
    if (activeTab === "past") return r.status === "COMPLETED" || r.status === "DISPUTED";
    return true;
  });

  const STATUS_LABEL: Record<string, string> = {
    PENDING: "PENDING", APPROVED: "ACTIVE", COMPLETED: "COMPLETED", DISPUTED: "DISPUTED",
  };

  const renderItem = ({ item }: { item: any }) => {
    const isOwner = item.itemOwnerId === user?.id || item.lenderId === user?.id;
    const totalCost = (item.itemDailyRate * item.totalDays).toFixed(0);
    const securityType = item.securityDeposit ? "Secured" : "Insured";

    return (
      <View style={styles.card}>
        {/* Full-width image */}
        <View style={styles.imageWrap}>
          {item.itemMediaUrls?.[0] ? (
            <Image source={{ uri: item.itemMediaUrls[0] }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImage, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>📦</Text>
            </View>
          )}
          {/* Status badge overlay */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{STATUS_LABEL[item.status] ?? item.status}</Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          {/* Title row + price */}
          <View style={styles.titleRow}>
            <Text style={styles.itemTitle} numberOfLines={2}>{item.itemTitle}</Text>
            <View style={styles.priceTag}>
              <Receipt size={14} color={colors.textPrimary} />
              <Text style={styles.priceText}>₹{totalCost}</Text>
            </View>
          </View>

          <Text style={styles.byLine}>by {item.lenderName ?? item.ownerName ?? "—"}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <CalendarBlank size={15} color={colors.textMuted} />
              <Text style={styles.metaText}>{item.totalDays} day{item.totalDays !== 1 ? "s" : ""}</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <ShieldCheck size={15} color={colors.textMuted} />
              <Text style={styles.metaText}>{securityType}</Text>
            </View>
          </View>

          {/* Action buttons — 2 per row */}
          <View style={styles.actionsGrid}>
            {/* Chat */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/chat/${item.id}`)}>
              <ChatCircle size={17} color={colors.textPrimary} />
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>

            {/* Agreement */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setAgreementRental(item)}>
              <FileText size={17} color={colors.textPrimary} />
              <Text style={styles.actionText}>Agreement</Text>
            </TouchableOpacity>

            {/* QR — lender show / borrower scan */}
            {item.status === "PENDING" && isOwner && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDark]}
                onPress={() => router.push(`/handover/lender/${item.id}`)}
              >
                <QrCode size={17} color="#fff" />
                <Text style={[styles.actionText, styles.actionTextLight]}>Show QR</Text>
              </TouchableOpacity>
            )}
            {item.status === "PENDING" && !isOwner && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDark]}
                onPress={() => router.push(`/handover/borrower/${item.id}`)}
              >
                <QrCode size={17} color="#fff" />
                <Text style={[styles.actionText, styles.actionTextLight]}>Scan QR</Text>
              </TouchableOpacity>
            )}

            {/* Complete — lender after approved */}
            {item.status === "APPROVED" && isOwner && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDark]}
                onPress={() => updateStatus.mutate({ id: item.id, action: "complete" })}
              >
                <CheckCircle size={17} color="#fff" />
                <Text style={[styles.actionText, styles.actionTextLight]}>Complete</Text>
              </TouchableOpacity>
            )}

            {/* Dispute */}
            {(item.status === "PENDING" || item.status === "APPROVED") && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnDanger]}
                onPress={() =>
                  Alert.alert("Dispute", "Mark this rental as disputed?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Dispute", style: "destructive", onPress: () => updateStatus.mutate({ id: item.id, action: "dispute" }) },
                  ])
                }
              >
                <WarningCircle size={17} color={colors.error ?? "#EF4444"} />
                <Text style={[styles.actionText, { color: colors.error ?? "#EF4444" }]}>Dispute</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Rentals</Text>
      </View>

      {/* Tab filter */}
      <View style={styles.tabs}>
        {(["all", "active", "past"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "all" ? "All Rentals" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : filteredRentals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔁</Text>
          <Text style={styles.emptyText}>No rentals yet</Text>
          <Text style={styles.emptySubtext}>Book an item to get started</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={(r) => r.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      )}

      <RentalAgreementModal
        rental={agreementRental}
        visible={!!agreementRental}
        onClose={() => setAgreementRental(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: { paddingHorizontal: spacing.margin, paddingTop: spacing.sm, paddingBottom: 4 },
  title: { ...font.headlineLg, color: colors.textPrimary },

  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.margin,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  tabText: { ...font.labelMd, color: colors.textSecondary },
  tabTextActive: { color: colors.background },

  list: { paddingHorizontal: spacing.margin, paddingBottom: 40, gap: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadow.ambient,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  imageWrap: { position: "relative", width: "100%", height: 200 },
  cardImage: { width: "100%", height: 200 },
  imagePlaceholder: {
    backgroundColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 48 },

  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    ...font.caption,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.6,
    fontSize: 11,
  },

  infoSection: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  itemTitle: {
    ...font.headlineMd,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingTop: 2,
  },
  priceText: {
    ...font.headlineMd,
    color: colors.textPrimary,
    fontSize: 16,
  },

  byLine: { ...font.caption, color: colors.textMuted },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 2,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { ...font.caption, color: colors.textMuted },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs ?? 4,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    flex: 1, minWidth: "45%",
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.border,
    justifyContent: "center",
  },
  actionBtnDark: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  actionBtnDanger: {
    borderColor: "#EF4444",
    backgroundColor: "transparent",
  },
  actionText: { ...font.labelMd, color: colors.textPrimary, fontSize: 13 },
  actionTextLight: { color: colors.background },

  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingText: { ...font.bodyMd, color: colors.textMuted },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...font.headlineMd, color: colors.textPrimary },
  emptySubtext: { ...font.bodyMd, color: colors.textMuted },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    maxHeight: "92%",
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: spacing.margin, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { ...font.headlineMd, color: colors.textPrimary },
  body: { paddingHorizontal: spacing.margin },
  agreementTitle: {
    ...font.headlineLg, color: colors.textPrimary,
    textAlign: "center", marginTop: spacing.lg,
    letterSpacing: 1,
  },
  agreementSub: { ...font.caption, color: colors.textMuted, textAlign: "center", marginTop: 4 },
  agreementDate: { ...font.caption, color: colors.textMuted, textAlign: "center", marginTop: 2, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionHead: { ...font.labelMd, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  party: { flex: 1, gap: 4 },
  partyDivider: { width: 1, backgroundColor: colors.border },
  partyRole: { ...font.caption, color: colors.textMuted, letterSpacing: 0.5 },
  partyName: { ...font.headlineMd, color: colors.textPrimary, fontSize: 16 },
  itemName: { ...font.headlineMd, color: colors.textPrimary },
  itemId: { ...font.caption, color: colors.textMuted, marginTop: 2 },
  termRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  termLabel: { ...font.bodyMd, color: colors.textSecondary },
  termValue: { ...font.labelMd, color: colors.textPrimary },
  clause: { ...font.bodyMd, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.sm },
  signatureRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  sigBlock: { flex: 1, alignItems: "center", gap: 6 },
  sigLine: { width: "100%", height: 1, backgroundColor: colors.textPrimary },
  sigName: { ...font.labelMd, color: colors.textPrimary },
  sigRole: { ...font.caption, color: colors.textMuted },
  footer: {
    ...font.caption, color: colors.textMuted,
    textAlign: "center", marginTop: spacing.xl,
    lineHeight: 18, paddingBottom: spacing.md,
  },
});
