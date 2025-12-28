// front/src/features/payments/api/legacy.ts
import type { CheckoutSessionResponse } from "@/shared/types";
import { createCheckoutSession } from "./checkout";
import { buildReturnUrls } from "./returnUrls";

// ==============================
// 後方互換（api_old.ts）
// ==============================

export async function createPpvCheckoutSession(postId: string): Promise<CheckoutSessionResponse> {
  const { successUrl, cancelUrl } = buildReturnUrls({ from: "ppv", postId });

  return createCheckoutSession({
    postId,
    successUrl,
    cancelUrl,
  });
}

export async function createPlanCheckoutSession(planId: string): Promise<CheckoutSessionResponse> {
  const { successUrl, cancelUrl } = buildReturnUrls({ from: "plan", planId });

  return createCheckoutSession({
    planId,
    successUrl,
    cancelUrl,
  });
}
