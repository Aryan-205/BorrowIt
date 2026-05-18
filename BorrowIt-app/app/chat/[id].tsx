import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, PaperPlaneTilt, WifiHigh, WifiSlash } from "phosphor-react-native";
import { useSession } from "../../lib/auth";
import { BASE_URL, apiFetch } from "../../lib/api";
import { colors, font, spacing, radius } from "../../lib/theme";

// Derive WebSocket URL from BASE_URL (https:// → wss://, http:// → ws://)
function getWsUrl(rentalId: string): string {
  const base = BASE_URL.replace(/\/$/, "");
  const wsBase = base.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://");
  return `${wsBase}/ws/chat/${rentalId}`;
}

type Message = {
  id: string;
  chatId: string;
  senderId: string | null;
  senderName: string | null;
  content: string;
  createdAt: string;
};

export default function ChatScreen() {
  const { id: rentalId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const connect = useCallback(() => {
    if (!rentalId) return;
    const url = getWsUrl(rentalId);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "history") {
            setMessages(payload.messages ?? []);
            setLoading(false);
            scrollToEnd();
          } else if (payload.type === "message") {
            setMessages((prev) => {
              // Avoid duplicate if we already appended optimistically
              if (prev.some((m) => m.id === payload.message.id)) return prev;
              return [...prev, payload.message];
            });
            scrollToEnd();
          } else if (payload.type === "error") {
            setError(payload.message);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = (e) => {
        setConnected(false);
        wsRef.current = null;
        if (e.code !== 1000 && e.code !== 4003) {
          // Reconnect after 3s unless intentional close or auth error
          reconnectTimer.current = setTimeout(connect, 3000);
        } else if (e.code === 4003) {
          setError("Not authorized for this chat");
          setLoading(false);
        }
      };

      ws.onerror = () => {
        setConnected(false);
        // Will trigger onclose which handles reconnect
      };
    } catch (err) {
      setError("WebSocket not supported — falling back to polling");
      // Fallback: load messages via REST
      apiFetch(`api/chats/${rentalId}`)
        .then((r) => r.json())
        .then((d: any) => {
          setMessages(d?.chat?.messages ?? d?.messages ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [rentalId, scrollToEnd]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, [connect]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content: trimmed }));
      setText("");
    } else {
      // Fallback REST send
      apiFetch(`api/chats/${rentalId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: trimmed }),
      })
        .then((r) => r.json())
        .then((d: any) => {
          if (d?.message) {
            setMessages((prev) => [...prev, d.message]);
            scrollToEnd();
          }
        });
      setText("");
    }
  }, [text, rentalId, scrollToEnd]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.senderName?.[0]?.toUpperCase() ?? "?"}</Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.content}</Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSub} numberOfLines={1}>Rental {rentalId?.slice(0, 8)}…</Text>
        </View>
        <View style={styles.connBadge}>
          {connected ? (
            <WifiHigh size={16} color="#22C55E" />
          ) : (
            <WifiSlash size={16} color={colors.textMuted} />
          )}
          <Text style={[styles.connText, { color: connected ? "#22C55E" : colors.textMuted }]}>
            {connected ? "Live" : "Offline"}
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {loading ? (
          <View style={styles.loadWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadText}>Connecting…</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptyHint}>Start the conversation</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            onContentSizeChange={scrollToEnd}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <PaperPlaneTilt size={20} color="#fff" weight="fill" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.margin, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { ...font.headlineMd, color: colors.textPrimary },
  headerSub: { ...font.caption, color: colors.textMuted },
  connBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  connText: { ...font.caption, fontWeight: "700" },
  errorBar: {
    backgroundColor: "#FEF2F2", paddingHorizontal: spacing.margin, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#FECACA",
  },
  errorText: { ...font.caption, color: "#DC2626" },
  loadWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadText: { ...font.bodyMd, color: colors.textMuted },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { ...font.headlineMd, color: colors.textPrimary },
  emptyHint: { ...font.bodyMd, color: colors.textMuted },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowOther: { justifyContent: "flex-start" },
  avatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.border, alignItems: "center", justifyContent: "center",
  },
  avatarText: { ...font.caption, color: colors.textSecondary, fontWeight: "700" },
  bubble: {
    maxWidth: "75%", borderRadius: radius.md, padding: spacing.sm, gap: 2,
  },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  senderName: { ...font.caption, color: colors.textMuted, fontWeight: "600" },
  msgText: { ...font.bodyMd, color: colors.textPrimary },
  msgTextMe: { color: "#fff" },
  msgTime: { ...font.caption, color: colors.textMuted, alignSelf: "flex-end" },
  msgTimeMe: { color: "rgba(255,255,255,0.6)" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: spacing.sm,
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1, ...font.bodyMd, color: colors.textPrimary,
    backgroundColor: colors.background, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
