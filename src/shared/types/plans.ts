// front/src/shared/types/plans.ts
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
  interval?: "month";
};

export type PlansResponse = {
  ok: true;
  plans: Plan[];
};

// ★ 新規プラン作成
export type CreatePlanPayload = {
  name: string;
  priceJpy: number;
};

export type UpdatePlanPayload = {
  name?: string;
  priceJpy?: number;
  isActive?: boolean;
  description?: string | null;
};

