// front/src/features/payments/api/history.ts
import { request } from "@/lib/api";
import type { PaymentRecord } from "@/types";

export function getMyPaymentHistory(): Promise<PaymentRecord[]> {
  return request<PaymentRecord[]>("/payments/history", { method: "GET" });
}
