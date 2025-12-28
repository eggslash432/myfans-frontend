// front/src/utils/plans.ts
import type { Plan } from "@/shared";

export function planPriceYen(p: Plan): number {
  // shared の実態に合わせて吸収（price が無い問題の解決）
  const anyPlan = p as any;
  return (
    anyPlan.priceJpy ??
    anyPlan.price ??
    anyPlan.amountJpy ??
    0
  );
}

export function planInterval(p: Plan): 'month' | 'year' {
  const anyPlan = p as any;
  return (anyPlan.billingInterval ?? anyPlan.interval ?? 'month') as 'month' | 'year';
}