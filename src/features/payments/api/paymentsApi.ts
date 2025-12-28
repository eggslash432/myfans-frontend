// front/src/lib/api/payments.ts
import type {
  CheckoutReq,
  CheckoutRes,
  CheckoutSessionResponse,
  PaymentRecord,
} from "../../shared/types";
import { request } from "./apiClient";

function buildReturnUrls(extra?: Record<string, string | number | boolean | null | undefined>) {
  const origin = window.location.origin;

  const params = new URLSearchParams();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v === null || v === undefined) continue;
      params.set(k, String(v));
    }
  }

  const qs = params.toString() ? `?${params.toString()}` : "";
  return {
    successUrl: `${origin}/payments/success${qs}`,
    cancelUrl: `${origin}/payments/cancel${qs}`,
  };
}

/** ✅ これだけが本体：/payments/checkout */
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

// ==============================
// 後方互換（api_old.ts）
// ==============================

export async function createPpvCheckoutSession(
  postId: string,
): Promise<CheckoutSessionResponse> {
  const { successUrl, cancelUrl } = buildReturnUrls({ from: "ppv", postId });

  return createCheckoutSession({
    postId,
    successUrl,
    cancelUrl,
  });
}

export async function createPlanCheckoutSession(
  planId: string,
): Promise<CheckoutSessionResponse> {
  const { successUrl, cancelUrl } = buildReturnUrls({ from: "plan", planId });

  return createCheckoutSession({
    planId,
    successUrl,
    cancelUrl,
  });
}

export function getMyPaymentHistory(): Promise<PaymentRecord[]> {
  return request<PaymentRecord[]>("/payments/history", { method: "GET" });
}
