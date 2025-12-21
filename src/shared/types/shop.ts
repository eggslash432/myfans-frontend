// front/src/shared/types/shop.ts

export type ShopCreatorApplicationStatus = "pending" | "approved" | "rejected";

export type ShopCreatorApplication = {
  id: string;
  userId: string;
  publicName: string;
  email: string;
  status: ShopCreatorApplicationStatus;
  createdAt: string;
  rejectReason?: string | null;
};

export type ShopCreatorApplicationsRes = {
  items: ShopCreatorApplication[];
  nextCursor: string | null;
};