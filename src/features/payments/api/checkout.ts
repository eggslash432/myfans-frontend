// front/src/features/payments/api/checkout.ts
import { request } from "@/lib/api";
import type { CheckoutReq, CheckoutRes, CheckoutSessionResponse } from "@/shared/types";

/** ✅ 本体：/payments/checkout */
export async function createCheckoutSession(input: CheckoutReq): Promise<CheckoutSessionResponse> {
  if (!input.successUrl || !input.cancelUrl) {
    throw new Error("successUrl/cancelUrl is required");
  }
  const data = await request<CheckoutRes>("/payments/checkout", {
    method: "POST",
    body: input,
  });
  return { url: data.url };
}
