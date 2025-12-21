// front/src/hooks/useShopMe.ts
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/apiClient";
import type { ShopMe } from "@/shared";

type Options = {
  enabled?: boolean;
};

export function useShopMe(options?: Options) {
  return useQuery({
    queryKey: ["shopMe"],
    enabled: options?.enabled ?? true,
    queryFn: () => request<ShopMe>("/shop/me", { method: "GET" }),
    retry: false, // 所属してないユーザーで毎回リトライしない
  });
}
