// front/src/features/audit/api/adminAuditLogs.ts
import { request } from "@/lib/api/apiClient";
import type { AuditLogsQuery, AuditLogsResponse } from "@/types";

function toQuery(q: AuditLogsQuery) {
  const p = new URLSearchParams();
  if (q.take) p.set("take", String(q.take));
  if (q.cursor != null) p.set("cursor", String(q.cursor));
  if (q.action) p.set("action", q.action);
  if (q.actorId) p.set("actorId", q.actorId);
  if (q.targetType) p.set("targetType", q.targetType);
  if (q.targetId) p.set("targetId", q.targetId);
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  if (q.actorQ) p.set("actorQ", q.actorQ);
  if (q.targetQ) p.set("targetQ", q.targetQ);  
  return p.toString();
}

export async function getAdminAuditLogs(
  q: AuditLogsQuery = {},
): Promise<AuditLogsResponse> {
  const qs = toQuery(q);
  const path = `/admin/audit-logs${qs ? `?${qs}` : ""}`;

  // request<T> は T をそのまま返す設計
  return request<AuditLogsResponse>(path, { method: "GET" });
}
