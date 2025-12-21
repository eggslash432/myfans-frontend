// front/src/hooks/useShopCreatorApplications.ts
import { useQuery } from "@tanstack/react-query";
import { shopListCreatorApplications } from "../lib/api/shop";
import type { ShopCreatorApplicationStatus } from "../lib/api/shop";
import type { ShopCreatorApplicationsRes } from "@/shared/types/shop";

export function useShopCreatorApplications(status: ShopCreatorApplicationStatus = "pending") {
  return useQuery<ShopCreatorApplicationsRes>({
    queryKey: ["shopCreatorApplications", status],
    queryFn: () => shopListCreatorApplications({ status }),
  });
}
