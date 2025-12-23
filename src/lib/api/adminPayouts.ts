// front/src/lib/api/adminPayouts.ts
import { request } from '@/lib/api/apiClient';
import type { AdminPayout, ApprovePayoutResult } from '@/shared';

export async function adminListPayouts() {
  return request<AdminPayout[]>('/admin/payouts', {
    method: 'GET',
  });
}

export function adminApprovePayout(payoutId: string): Promise<ApprovePayoutResult> {
  return request<ApprovePayoutResult>(`/admin/payouts/${payoutId}/approve`, {
    method: 'POST',
  });
}

export function adminRejectPayout(payoutId: string, reason?: string): Promise<void> {
  return request<void>(`/admin/payouts/${payoutId}/reject`, {
    method: 'POST',
    body: reason ? { reason } : {},
  });
}

export async function adminDownloadPayoutCsv(month?: string) {
  const q = month ? `?month=${month}` : '';
  window.location.href = `/api/admin/payouts/csv${q}`;
}
