// front/src/lib/payments.ts
import type { CheckoutReq, CheckoutRes, CheckoutSessionResponse, PaymentRecord } from "../../shared/types";
import { request } from "./apiClient";

export async function createCheckoutSession(
  input: CheckoutReq,
): Promise<string> {
  const data = await request<CheckoutRes>("/payments/checkout", {
    method: "POST",
    body: input,
  });
  return data.url;
}

// ==============================
// 後方互換（api_old.ts）
// ==============================

export function createPpvCheckoutSession(postId: string): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>(`/payments/ppv/${postId}/checkout`, {
    method: 'POST',
  });
}

export function createPlanCheckoutSession(planId: string): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>(`/payments/plans/${planId}/checkout`, {
    method: 'POST',
  });
}

export function getMyPaymentHistory(): Promise<PaymentRecord[]> {
  return request<PaymentRecord[]>('/payments/history', {
    method: 'GET',
  });
}
