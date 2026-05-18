import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "./api";

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  return res;
}

export async function signIn(email: string, password: string) {
  const res = await apiFetch("api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).message ?? "Login failed");
  return data;
}

export async function signUp(name: string, email: string, password: string) {
  const res = await apiFetch("api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as any).message ?? "Registration failed");
  return data;
}

export async function signOut() {
  await apiFetch("api/auth/signout", { method: "POST" });
}

export function useSession() {
  const { data, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}api/users/me`, { credentials: "include" });
      if (res.status === 401) return null;
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });
  const user = (data as any)?.user ?? null;
  return { user, isLoading };
}

export function useInvalidateSession() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["session"] });
}
