// front/src/shared/types/domain/payments/checkout.ts

export type CheckoutReq = {
  postId?: string;
  planId?: string;

  // Stripe Checkout の戻り先
  successUrl?: string;
  cancelUrl?: string;
};

// 既存互換：いろんなキー名が混在してる想定
export type CheckoutResponse = {
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
  pubKey?: string;
  publishableKey?: string;
};

export type CheckoutSessionResponse = { url: string };