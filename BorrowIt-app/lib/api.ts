import { hc } from "hono/client";
import Constants from "expo-constants";

/** API origin (same host the Hono app uses with `/api` base path). */
const baseUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:4200/";

/** Hono RPC client; `any` avoids requiring the monorepo `@template/web` package for types. */
export const api = hc<any>(baseUrl).api;
