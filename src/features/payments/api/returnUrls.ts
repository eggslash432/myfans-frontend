// front/src/features/payments/api/returnUrls.ts
export function buildReturnUrls(
  extra?: Record<string, string | number | boolean | null | undefined>,
) {
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
