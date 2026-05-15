"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  updateItem,
  type Item,
} from "@/services/items";

export const itemsQueryKey = ["items"] as const;
export const itemQueryKey = (id: string) => ["items", id] as const;

export function useItems() {
  return useQuery({
    queryKey: itemsQueryKey,
    queryFn: getItems,
  });
}

export function useItem(itemId: string | undefined) {
  return useQuery({
    queryKey: itemQueryKey(itemId ?? ""),
    queryFn: () => getItemById(itemId!),
    enabled: Boolean(itemId),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export function useUpdateItem(itemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
      queryClient.invalidateQueries({ queryKey: itemQueryKey(itemId) });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

export type { Item };
