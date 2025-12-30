// front/src/shared/types/domain/payments/payout.ts
import type { PayoutStatus } from "../../prisma";

export type Payout = {
  id: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
};
