import { request } from "@/lib/api";
import type { AdminSalesBreakdown, AdminPaymentRow, FeeSettings } from "@/shared";

export async function adminGetFeeSetting(): Promise<FeeSettings> {
  return request<FeeSettings>("/admin/fee-setting");
}

export async function adminGetSalesBreakdown(month: string): Promise<AdminSalesBreakdown> {
  const q = new URLSearchParams({ month });
  return request<AdminSalesBreakdown>(`/admin/sales/breakdown?${q.toString()}`);
}

export async function adminListPayments(month: string, limit = 30): Promise<AdminPaymentRow[]> {
  const q = new URLSearchParams({ month, limit: String(limit) });
  return request<AdminPaymentRow[]>(`/admin/payments?${q.toString()}`);
}
