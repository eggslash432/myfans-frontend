// front/src/features/errorLogs/api/adminErrorLogs.ts

import { request } from "@/lib/api/apiClient";

export type ErrorLogsQuery = {
  take?: number;
  cursor?: number | null;
  q?: string;
  statusCode?: number;
  userId?: string;
  path?: string;
  from?: string; // ISO
  to?: string;   // ISO
};

export type ErrorLogRow = {
  id: number;
  createdAt: string; // APIはJSONなので基本string
  level: string;
  message: string;
  name?: string | null;
  stack?: string | null;
  statusCode?: number | null;
  method?: string | null;
  path?: string | null;
  userId?: string | null;
  role?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: any;
};

export type ErrorLogsResponse = {
  rows: ErrorLogRow[];
  nextCursor: number | null;
};

function toQuery(q: ErrorLogsQuery) {
  const p = new URLSearchParams();
  if (q.take != null) p.set("take", String(q.take));
  if (q.cursor != null) p.set("cursor", String(q.cursor));
  if (q.q) p.set("q", q.q);
  if (q.statusCode != null) p.set("statusCode", String(q.statusCode));
  if (q.userId) p.set("userId", q.userId);
  if (q.path) p.set("path", q.path);
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  return p.toString();
}

export async function getAdminErrorLogs(
  q: ErrorLogsQuery = {},
): Promise<ErrorLogsResponse> {
  const qs = toQuery(q);
  const path = `/admin/error-logs${qs ? `?${qs}` : ""}`;

  // request() は API_BASE を含めてくれる & tokenも付与される
  return request<ErrorLogsResponse>(path, { method: "GET" });
}
