// front/src/features/shops/hooks/useShopContext.ts

import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/apiClient";

export type ShopContext = {
  shopId: string;
  role: string;
  businessLicenseStatus: "pending" | "approved" | "rejected" | string;
};

type Options = { enabled?: boolean };

export function useShopContext(options?: Options) {
  return useQuery({
    queryKey: ["shopContext"],
    enabled: options?.enabled ?? true,
    queryFn: () => request<ShopContext>("/shops/me/context", { method: "GET" }),
    retry: false,
    staleTime: 60_000, // BottomNavのために無駄に叩かない
  });
}
