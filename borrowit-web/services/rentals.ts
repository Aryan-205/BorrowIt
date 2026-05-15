import { apiFetch } from "@/lib/api";
import type { RentalClient } from "@/lib/rentalTypes";

export type { RentalClient };

/** GET /api/rentals */
export async function listRentals(): Promise<{ rentals: RentalClient[] }> {
  return apiFetch("/api/rentals");
}

/** GET /api/rentals/:id */
export async function getRentalById(rentalId: string): Promise<{ rental: RentalClient }> {
  return apiFetch(`/api/rentals/${rentalId}`);
}

export type BookRentalInput = {
  itemId: string;
  totalDays: number;
};

/** POST /api/rentals/book */
export async function bookRental(input: BookRentalInput): Promise<{ rental: RentalClient }> {
  return apiFetch("/api/rentals/book", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type GenerateQrResponse = {
  qrData: string;
  token: string;
};

/** POST /api/rentals/:id/generate-qr */
export async function generateRentalQr(rentalId: string): Promise<GenerateQrResponse> {
  return apiFetch(`/api/rentals/${rentalId}/generate-qr`, {
    method: "POST",
  });
}
