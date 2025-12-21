// front/src/hooks/useShopCreatorApplications.ts

import { useQuery } from "@tanstack/react-query";
import { getShopCreatorApplications } from "../lib/api/shop";

export function useShopCreatorApplications() {
  return useQuery({
    queryKey: ["shop", "creator-applications"],
    queryFn: getShopCreatorApplications,
    staleTime: 30_000,
  });
}
