// front/src/features/creators/api/legacy.ts
import { request } from "@/lib/api";
import type { CreatorMeResponse } from "@/shared/types";

// ==============================
// 後方互換（api_old.ts）
// ==============================

export function applyCreator(dto: { publicName: string }): Promise<CreatorMeResponse> {
  return request<CreatorMeResponse>("/creators/apply", {
    method: "POST",
    body: dto,
  });
}

export function getCreatorPayoutSummary(): Promise<unknown> {
  return request<unknown>("/creators/me/payouts/summary", { method: "GET" });
}

export function requestPayout(input: { amountJpy: number }): Promise<unknown> {
  return request<unknown>("/creators/me/payouts", {
    method: "POST",
    body: input,
  });
}

export function getCreatorPayoutHistory(): Promise<unknown> {
  return request<unknown>("/creators/me/payouts/history", { method: "GET" });
}
