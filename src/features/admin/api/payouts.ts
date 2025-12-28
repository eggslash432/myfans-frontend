import { API_BASE, ApiError, request } from "@/lib/api";
import type { AdminPayout, ApprovePayoutResult } from "@/shared";

export function adminListPayouts(): Promise<AdminPayout[]> {
  return request<AdminPayout[]>("/admin/payouts", { method: "GET" });
}

export function adminApprovePayout(payoutId: string): Promise<ApprovePayoutResult> {
  return request<ApprovePayoutResult>(`/admin/payouts/${payoutId}/approve`, { method: "POST" });
}

export function adminRejectPayout(payoutId: string, reason?: string): Promise<void> {
  return request<void>(`/admin/payouts/${payoutId}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
}

/** CSVダウンロード（blobなのでfetch直が妥当） */
export async function adminDownloadPayoutCsv(month?: string) {
  const q = month ? `?month=${encodeURIComponent(month)}` : "";
  const url = `${API_BASE}/admin/payouts/csv${q}`;

  const token = localStorage.getItem("access_token");
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    let body: any = null;
    try { body = JSON.parse(text); } catch { body = { message: text }; }
    throw new ApiError(res.status, body, body?.message ?? "CSV download failed");
  }

  const cd = res.headers.get("content-disposition") ?? "";
  const m = cd.match(/filename="([^"]+)"/);
  const filename = m?.[1] ?? (month ? `payouts_${month}.csv` : "payouts_all.csv");

  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
