import { apiFetch } from "@/lib/api";
import type { User } from "@/types/type";

export async function getUser(userId: string): Promise<{ user: User }> {
  return apiFetch(`/api/users/${userId}`);
}

export async function getUserById(userId: string): Promise<{ user: User }> {
  return apiFetch(`/api/users/${userId}`);
}

export async function getMe(): Promise<{ user: User }> {
  return apiFetch("/api/users/me");
}

export async function createUser(data: Record<string, unknown>) {
  return apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
  return apiFetch(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(userId: string) {
  return apiFetch(`/api/users/${userId}`, { method: "DELETE" });
}
