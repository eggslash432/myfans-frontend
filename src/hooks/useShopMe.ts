// front/src/hooks/useShopMe.ts

import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/apiClient";
import type { ShopMe } from "@/shared";

export function useShopMe() {
  return useQuery({
    queryKey: ["shopMe"],
    queryFn: async () => {
      // 所属してなければ 403 を返す想定（その場合は error 扱いになる）
      return request<ShopMe>("/shop/me", { method: "GET" });
    },
    // 所属してないユーザーで毎回リトライしない
    retry: false,
  });
}
