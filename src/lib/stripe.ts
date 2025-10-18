// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
    if (!pk) throw new Error("VITE_STRIPE_PUBLISHABLE_KEY が未設定です");
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

// src/lib/stripe.ts
export async function redirectToCheckoutSafe(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe || !('redirectToCheckout' in stripe)) {
    throw new Error('Stripe failed to initialize');
  }
  return (stripe as any).redirectToCheckout({ sessionId });
}