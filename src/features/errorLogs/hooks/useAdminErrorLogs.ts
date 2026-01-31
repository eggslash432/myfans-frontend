// front/src/features/errorLogs/hooks/useAdminErrorLogs.ts

import { useQuery } from "@tanstack/react-query";
import { getAdminErrorLogs, type ErrorLogsQuery } from "../api/adminErrorLogs";

export function useAdminErrorLogs(query: ErrorLogsQuery) {
  return useQuery({
    queryKey: ["admin_error_logs", query],
    queryFn: () => getAdminErrorLogs(query),
  });
}
