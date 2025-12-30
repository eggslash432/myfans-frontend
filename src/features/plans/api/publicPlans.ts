// front/src/features/plans/api/publicPlans.ts
import { request } from "@/lib/api";
import type { PlansResponse } from "@/types";

/** クリエイターの公開プラン一覧 */
export function getCreatorPlans(creatorId: string): Promise<PlansResponse> {
  const qs = new URLSearchParams({ creatorId });
  return request<PlansResponse>(`/plans?${qs.toString()}`);
}

/** 単一プラン取得 */
export function getPlan(planId: string): Promise<unknown> {
  return request(`/plans/${planId}`);
}
