export type ItemSpec = { label: string; value: string };

export type ItemDetail = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dailyRate: number;
  securityDeposit?: number;
  lat?: number;
  lng?: number;
  mediaUrls?: string[];
  isAvailable: boolean;
  specs?: ItemSpec[];
  ownerId: string;
  ownerName?: string;
  ownerKarma?: number;
  ownerKarmaCount?: number;
  ownerIsVerified?: boolean;
};

export type OwnerItem = {
  id: string;
  title: string;
  dailyRate: number;
  mediaUrls: string[];
};

export type ItemResponse = {
  item: ItemDetail;
  ownerItems?: OwnerItem[];
};

export type SessionUser = {
  id: string;
  username?: string;
  email?: string;
};
