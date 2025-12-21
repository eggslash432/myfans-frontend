// front/src/hooks/useShopSalesSummary.ts

import { useQuery } from "@tanstack/react-query";
import { getShopSalesSummary, type ShopSalesRange } from "../lib/api/shop";

export function useShopSalesSummary(range: ShopSalesRange) {
  return useQuery({
    queryKey: ["shop", "sales", "summary", range],
    queryFn: () => getShopSalesSummary(range),
    staleTime: 30_000,
  });
}
