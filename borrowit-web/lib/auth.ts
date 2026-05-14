import { createAuthClient } from "better-auth/react";
import { apiBase } from "./env";

/** Web client — no Expo secure store; session uses cookies when your API serves better-auth. */
export const authClient = createAuthClient({
  baseURL: `${apiBase()}/api/auth`,
});
