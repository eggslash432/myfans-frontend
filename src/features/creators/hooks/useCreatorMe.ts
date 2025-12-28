// front/src/hooks/useCreatorMe.ts
import { useQuery } from "@tanstack/react-query";
import { request } from "../lib/api/apiClient";

export type CreatorMe = {
  approvalStatus: "pending" | "approved" | "rejected";
  // 必要なら追加で fields
  // isCreator?: boolean;
};

type Options = {
  enabled?: boolean;
};

function unwrap<T>(res: any): T {
  // request() が { data: ... } でも、直返しでも両対応
  return (res?.data ?? res) as T;
}

export type CreatorMeOrNull = CreatorMe | null;

export function useCreatorMe(options?: Options) {
  return useQuery({
    queryKey: ["creatorMe"],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<CreatorMeOrNull> => {
      try {
        const res = await request<any>("/creators/me", { method: "GET" });
        return unwrap<CreatorMe>(res);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 404) return null; // 未申請
        throw e; // それ以外はエラーとして扱う
      }
    },
    retry: false,
  });
}
