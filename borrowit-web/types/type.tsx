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

export type User = {
  id: string;
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  karma?: number;
  karmaCount?: number;
  isVerified?: boolean;
  avatar?: string;
  phoneNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};