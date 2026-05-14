import { Tabs } from "expo-router";
import { House, PlusCircle, ArrowsLeftRight, User } from "phosphor-react-native";
import { colors } from "../../lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="lend"
        options={{
          title: "List",
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rentals"
        options={{
          title: "Rentals",
          tabBarIcon: ({ color, size }) => <ArrowsLeftRight color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
