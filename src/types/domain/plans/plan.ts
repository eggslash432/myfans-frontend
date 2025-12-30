// front/src/shared/types/domain/plans/plan.ts

import type { BillingInterval } from "@/shared/prisma-enums";

export type Plan = {
  id: string;
  creatorId: string;
  name: string;
  priceJpy: number;
  description?: string | null;
  isActive: boolean;
  externalPriceId?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  interval?: BillingInterval;
};
