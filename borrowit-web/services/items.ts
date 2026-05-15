import { apiFetch } from "@/lib/api";

export type Item = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dailyRate: number;
  securityDeposit: number;
  mediaUrls: string[];
  isAvailable: boolean;
  ownerId?: string;
  ownerName?: string | null;
  ownerKarma?: number | null;
  ownerKarmaCount?: number | null;
  ownerIsVerified?: boolean;
  lat: number;
  lng: number;
};

export async function getItems(): Promise<{ items: Item[] }> {
  return apiFetch("/api/items");
}

export async function getItemById(itemId: string): Promise<{ item: Item }> {
  return apiFetch(`/api/items/${itemId}`);
}

export async function createItem(data: Record<string, unknown>) {
  return apiFetch("/api/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateItem(itemId: string, data: Record<string, unknown>) {
  return apiFetch(`/api/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteItem(itemId: string) {
  return apiFetch(`/api/items/${itemId}`, { method: "DELETE" });
}
