"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getMe,
  getUser,
  updateUser,
} from "@/services/user";

export const meQueryKey = ["users", "me"] as const;
export const userQueryKey = (id: string) => ["users", id] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
  });
}

export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: userQueryKey(userId ?? ""),
    queryFn: () => getUser(userId!),
    enabled: Boolean(userId),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKey(userId) });
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}