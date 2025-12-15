// front/src/shared/types/payments.ts
import type { PaymentStatus, PayoutStatus } from "../prisma-enums";

export type CheckoutResponse = {
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
  pubKey?: string;
  publishableKey?: string;
};

export type CheckoutSessionResponse = { url: string };

export type Payout = {
  id: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
};

export interface PaymentRecord {
  id: string;
  amountJpy: number;
  status: PaymentStatus;
  createdAt: string; // ISO
  paidAt?: string | null;
}

export type CheckoutReq = {
  postId?: string;
  planId?: string;

  // 追加（Stripe Checkout の戻り先）
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutRes = { 
  url: string 
};

export type PaymentSummary = any; // ★ 型未確定なら当面 any でOK（検収優先）
