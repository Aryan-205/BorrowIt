import { Tabs } from "expo-router";
import { House, PlusCircle, ArrowsLeftRight, User } from "phosphor-react-native";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { colors, font, spacing, radius, shadow } from "../../lib/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { name: "index", label: "Discover", Icon: House },
  { name: "lend", label: "List", Icon: PlusCircle },
  { name: "rentals", label: "Rentals", Icon: ArrowsLeftRight },
  { name: "profile", label: "Profile", Icon: User },
];

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
}: {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const tab = TABS.find((t) => t.name === route.name);
  if (!tab) return null;
  const { Icon, label } = tab;

  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { stiffness: 400, damping: 20 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 20 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabTouch}
    >
      <Animated.View style={[isFocused ? styles.pillActive : styles.pillInactive, animStyle]}>
        <Icon
          size={20}
          weight={isFocused ? "fill" : "regular"}
          color={isFocused ? "#fff" : colors.textMuted}
        />
        {isFocused && (
          <Text style={styles.pillLabel} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barWrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Discover" }} />
      <Tabs.Screen name="lend" options={{ title: "List" }} />
      <Tabs.Screen name="rentals" options={{ title: "Rentals" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: spacing.margin,
    marginBottom: 0,
    gap: 4,
    ...shadow.ambient,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  tabTouch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  pillActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillInactive: {
    width: 44,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  pillLabel: {
    ...font.caption,
    fontWeight: "700",
    color: "#fff",
    fontSize: 12,
  },
});
