// front/src/hooks/useShopDashboardSummary.ts

import { useQuery } from "@tanstack/react-query";
import { getShopDashboardSummary } from "../lib/api/shopDashboard";

export function useShopDashboardSummary() {
  return useQuery({
    queryKey: ["shop", "dashboard", "summary"],
    queryFn: getShopDashboardSummary,
    staleTime: 30_000,
  });
}
