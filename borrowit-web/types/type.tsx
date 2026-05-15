export type ItemDetail = {
  id: string;
  title: string;
  description?: string;
  category: string;
  dailyRate: number;
  securityDeposit: number;
  mediaUrls: string[];
  isAvailable: boolean;
  ownerId: string;
  ownerName?: string;
  ownerKarma?: number;
  ownerKarmaCount?: number;
  ownerIsVerified?: boolean;
};