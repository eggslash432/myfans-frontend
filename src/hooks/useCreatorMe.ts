// front/src/hooks/useCreatorMe.ts
import { useQuery } from "@tanstack/react-query";
import { request } from "../lib/api/apiClient";

export type CreatorMe = {
  approvalStatus: "pending" | "approved" | "rejected";
};

type Options = {
  enabled?: boolean;
};

export function useCreatorMe(options?: Options) {
  return useQuery({
    queryKey: ["creatorMe"],
    enabled: options?.enabled ?? true,
    queryFn: () => request<CreatorMe>("/creator/me", { method: "GET" }),
    retry: false, // 403 は未登録扱い
  });
}
