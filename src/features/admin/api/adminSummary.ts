import { request } from "@/lib/api";
import type { AdminSummary } from "@/shared";

export function adminGetSummary(): Promise<AdminSummary> {
  return request<AdminSummary>("/admin/summary");
}
