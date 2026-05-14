/** Mirrors BorrowIt-backend `rentalToClient` shape for list/detail responses. */
export type RentalClient = {
  id: string;
  status: string;
  itemId: string;
  borrowerId: string;
  itemOwnerId: string;
  totalDays: number;
  itemTitle: string;
  itemDailyRate: number;
  itemMediaUrls: string[];
  pickupVideoUrl?: string | null;
  returnVideoUrl?: string | null;
};
