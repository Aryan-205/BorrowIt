import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_KEY = "borrowit_session";
const API_PORT = 4000;

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

/** Host from Expo dev server (same machine as Metro), e.g. 192.168.1.7 */
function getDevMachineHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | null)?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(":")[0] ?? null;
}

function resolveApiUrl(): string {
  const configured = normalizeBaseUrl(
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
      process.env.EXPO_PUBLIC_API_URL ??
      "http://localhost:4000/",
  );

  // Physical devices cannot reach your Mac via localhost — use LAN IP from Expo
  if (__DEV__ && Platform.OS !== "web" && configured.includes("localhost")) {
    const devHost = getDevMachineHost();
    if (devHost) {
      return `http://${devHost}:${API_PORT}/`;
    }
  }

  return configured;
}

/** API origin — trailing slash included */
export const BASE_URL: string = resolveApiUrl();

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    return await fetch(`${BASE_URL}${path.replace(/^\//, "")}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${BASE_URL}. Start the backend (BorrowIt-backend, port ${API_PORT}) and ensure your phone is on the same Wi‑Fi. Update EXPO_PUBLIC_API_URL in BorrowIt-app/.env to your Mac IP (run: ipconfig getifaddr en0).`,
    );
  }
}
