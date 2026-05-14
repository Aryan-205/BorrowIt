import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const rawBase =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.replace(/\/?$/, "") ??
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/?$/, "") ??
  "http://localhost:4200";

export const authClient = createAuthClient({
  baseURL: `${rawBase}/api/auth`,
  plugins: [
    expoClient({
      scheme: (Constants.expoConfig?.scheme as string) ?? "borrowit",
      storagePrefix: "borrowit",
      storage: SecureStore,
    }),
  ],
});
