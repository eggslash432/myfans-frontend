// front/src/features/audit/hooks/useAdminAuditLogs.ts

import { useQuery } from "@tanstack/react-query";
import { getAdminAuditLogs, type AuditLogsQuery } from "../api/adminAuditLogs";

export function useAdminAuditLogs(q: AuditLogsQuery) {
  return useQuery({
    queryKey: ["admin-audit-logs", q],
    queryFn: () => getAdminAuditLogs(q),
  });
}
