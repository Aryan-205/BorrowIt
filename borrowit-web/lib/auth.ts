import { createAuthClient } from "better-auth/react";
import { apiBase } from "@/lib/api";

/** Web client — session uses cookies when your API serves better-auth. */
export const authClient = createAuthClient({
  baseURL: `${apiBase()}/api/auth`,
});
