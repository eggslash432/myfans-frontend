// front/src/features/plans/api/operations.ts
import { request } from "@/lib/api";

/** プラン並び替え */
export function reorderPlans(planIds: string[]): Promise<unknown> {
  return request("/plans/reorder", {
    method: "PATCH",
    body: { planIds },
  });
}

/** 非公開→再公開 */
export function reactivatePlan(planId: string): Promise<unknown> {
  return request(`/plans/${planId}/reactivate`, {
    method: "PATCH",
    body: {}, // JSON送信の形を保つ
  });
}
