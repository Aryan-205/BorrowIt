export type ItemRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  dailyRate: number;
  securityDeposit: number;
  lat: number;
  lng: number;
  mediaUrls: string[];
  isAvailable: boolean;
  ownerId: string;
  ownerName: string;
  ownerKarma: number;
  ownerKarmaCount: number;
  ownerIsVerified: boolean;
};

export type RentalRow = {
  id: string;
  itemId: string;
  borrowerId: string;
  itemOwnerId: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED";
  totalDays: number;
  itemTitle: string;
  itemDailyRate: number;
  itemMediaUrls: string[];
  pickupVideoUrl?: string | null;
  returnVideoUrl?: string | null;
  lastToken?: string;
  activateTimer?: ReturnType<typeof setTimeout>;
};
