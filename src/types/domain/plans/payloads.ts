// front/src/shared/types/domain/plans/payloads.ts
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
