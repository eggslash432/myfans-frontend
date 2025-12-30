// front/src/shared/types/domain/payments/payment.ts
import type { PaymentStatus } from "../../prisma";

export interface PaymentRecord {
  id: string;
  amountJpy: number;
  status: PaymentStatus;
  createdAt: string; // ISO
  paidAt?: string | null;
}
