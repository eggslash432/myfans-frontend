// front/src/hooks/useShopSalesSummary.ts

import { useQuery } from "@tanstack/react-query";
import type { ShopSalesRange } from "@/shared";
import { getShopSalesSummary } from "../api/sales";

export function useShopSalesSummary(range: ShopSalesRange) {
  return useQuery({
    queryKey: ["shop", "sales", "summary", range],
    queryFn: () => getShopSalesSummary(range),
    staleTime: 30_000,
  });
}
