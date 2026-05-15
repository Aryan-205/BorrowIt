"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bookRental,
  generateRentalQr,
  getRentalById,
  listRentals,
  type BookRentalInput,
  type RentalClient,
} from "@/services/rentals";
import { itemsQueryKey } from "./useItems";

export const rentalsQueryKey = ["rentals"] as const;
export const myRentalsQueryKey = ["my-rentals"] as const;
export const rentalQueryKey = (id: string) => ["rentals", id] as const;

/** GET /api/rentals — current user's rentals */
export function useRentals() {
  return useQuery({
    queryKey: myRentalsQueryKey,
    queryFn: listRentals,
  });
}

type UseRentalOptions = {
  /** Poll rental status (e.g. handover screens). Set `false` to disable. */
  refetchInterval?: number | false;
};

/** GET /api/rentals/:id */
export function useRental(rentalId: string | undefined, options?: UseRentalOptions) {
  return useQuery({
    queryKey: rentalQueryKey(rentalId ?? ""),
    queryFn: () => getRentalById(rentalId!),
    enabled: Boolean(rentalId),
    refetchInterval: options?.refetchInterval,
  });
}

/** POST /api/rentals/book */
export function useBookRental() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookRentalInput) => bookRental(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalsQueryKey });
      queryClient.invalidateQueries({ queryKey: myRentalsQueryKey });
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}

/** POST /api/rentals/:id/generate-qr */
export function useGenerateRentalQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rentalId: string) => generateRentalQr(rentalId),
    onSuccess: (_data, rentalId) => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKey(rentalId) });
      queryClient.invalidateQueries({ queryKey: myRentalsQueryKey });
    },
  });
}

export type { RentalClient, BookRentalInput };
