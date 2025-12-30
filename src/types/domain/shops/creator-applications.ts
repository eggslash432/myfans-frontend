// front/src/shared/types/domain/shops/creator-applications.ts
import type { ShopCreatorApplicationStatus } from "./roles";

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
