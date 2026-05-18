import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { colors, font, radius, spacing } from "../../lib/theme";

export type AlertButtonStyle = "default" | "cancel" | "destructive";

export type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

type AlertOptions = {
  cancelable?: boolean;
};

type AlertConfig = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
};

type AlertContextValue = {
  show: (config: AlertConfig) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

let alertHandler: ((config: AlertConfig) => void) | null = null;

function AlertModal({
  config,
  onDismiss,
}: {
  config: AlertConfig | null;
  onDismiss: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!config) return;
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [config, opacity, scale]);

  const dismiss = useCallback(
    (button?: AlertButton) => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 140, useNativeDriver: true }),
      ]).start(() => {
        onDismiss();
        button?.onPress?.();
      });
    },
    [onDismiss, opacity, scale],
  );

  if (!config) return null;

  const buttons =
    config.buttons?.length ? config.buttons : [{ text: "OK", style: "default" as const }];
  const cancelable = config.options?.cancelable !== false;

  return (
    <Modal transparent visible animationType="none" onRequestClose={() => cancelable && dismiss()}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => cancelable && dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.title}>{config.title}</Text>
          {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

          <View style={[styles.actions, buttons.length > 2 && styles.actionsStacked]}>
            {buttons.map((btn, i) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";
              const stacked = buttons.length > 2;

              return (
                <Pressable
                  key={`${btn.text ?? i}-${i}`}
                  onPress={() => dismiss(btn)}
                  style={({ pressed }) => [
                    styles.btn,
                    stacked ? styles.btnStacked : styles.btnInline,
                    isCancel && styles.btnCancel,
                    !isCancel && !isDestructive && styles.btnPrimary,
                    isDestructive && styles.btnDestructive,
                    pressed && styles.btnPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel && styles.btnTextCancel,
                      isDestructive && styles.btnTextDestructive,
                      !isCancel && !isDestructive && styles.btnTextPrimary,
                    ]}
                  >
                    {btn.text ?? (isCancel ? "Cancel" : "OK")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const show = useCallback((next: AlertConfig) => setConfig(next), []);
  const hide = useCallback(() => setConfig(null), []);

  useEffect(() => {
    alertHandler = show;
    return () => {
      alertHandler = null;
    };
  }, [show]);

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <AlertModal config={config} onDismiss={hide} />
    </AlertContext.Provider>
  );
}

/** Drop-in replacement for React Native's Alert.alert */
export const Alert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    if (alertHandler) {
      alertHandler({ title, message, buttons, options });
      return;
    }
    console.warn("[Alert] Provider not mounted —", title, message);
  },
};

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.margin,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    ...font.headlineMd,
    color: colors.textPrimary,
    textAlign: "center",
  },
  message: {
    ...font.bodyMd,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionsStacked: {
    flexDirection: "column",
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: radius.sm,
  },
  btnInline: {
    minWidth: 0,
  },
  btnStacked: {
    flex: 0,
    width: "100%",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnCancel: {
    backgroundColor: colors.background,
  },
  btnDestructive: {
    backgroundColor: "#FEF2F2",
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    ...font.labelMd,
    fontSize: 15,
  },
  btnTextPrimary: {
    color: "#FFFFFF",
  },
  btnTextCancel: {
    color: colors.textSecondary,
  },
  btnTextDestructive: {
    color: colors.error,
  },
});
