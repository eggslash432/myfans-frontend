// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe as StripeJS } from '@stripe/stripe-js';

let stripeP: Promise<StripeJS | null>;

export function getStripe(): Promise<StripeJS | null> {
  if (!stripeP) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
    stripeP = loadStripe(key);
  }
  return stripeP;
}

// src/lib/stripe.ts
export async function redirectToCheckoutSafe(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe || !('redirectToCheckout' in stripe)) {
    throw new Error('Stripe failed to initialize');
  }
  return (stripe as any).redirectToCheckout({ sessionId });
}