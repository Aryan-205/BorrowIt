import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSession } from "../lib/auth";
import { AlertProvider } from "../components/ui/Alert";

const queryClient = new QueryClient();

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 220,
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <AuthGate />
      </AlertProvider>
    </QueryClientProvider>
  );
}
