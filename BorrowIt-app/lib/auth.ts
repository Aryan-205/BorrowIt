import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, setStoredToken } from "./api";

export { apiFetch } from "./api";

export async function signIn(email: string, password: string) {
  const res = await apiFetch("api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Login failed");
  if (typeof (data as { token?: string }).token === "string") {
    await setStoredToken((data as { token: string }).token);
  }
  return data;
}

export async function signUp(name: string, email: string, password: string) {
  const res = await apiFetch("api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message ?? "Registration failed");
  if (typeof (data as { token?: string }).token === "string") {
    await setStoredToken((data as { token: string }).token);
  }
  return data;
}

export async function signOut() {
  await apiFetch("api/auth/signout", { method: "POST" });
  await setStoredToken(null);
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await apiFetch("api/users/me");
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load session");
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });
  const user = (data as { user?: unknown } | null)?.user ?? null;
  return { user, isLoading };
}

export function useInvalidateSession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["session"] });
}
