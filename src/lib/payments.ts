import { apiPost } from './http';

export type CheckoutReq = { postId?: string; planId?: string };
export type CheckoutRes = { url: string };

export async function createCheckoutSession(input: CheckoutReq): Promise<string> {
  const { url } = await apiPost<CheckoutRes>('/payments/checkout', input);
  return url;
}