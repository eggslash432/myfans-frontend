// front/src/features/creators/api/payouts.ts
import { request } from "@/lib/api";
import type { CreatorPayoutBalanceResponse, Payout } from "@/shared/types";

export function getCreatorPayoutBalance(): Promise<CreatorPayoutBalanceResponse> {
  return request<CreatorPayoutBalanceResponse>("/creators/me/payouts/balance", { method: "GET" });
}

export function listCreatorPayouts(): Promise<Payout[]> {
  return request<Payout[]>("/creators/me/payouts", { method: "GET" });
}

/** 新しめの申請API（amountJpyを直で渡す版） */
export function requestCreatorPayout(amountJpy: number): Promise<unknown> {
  return request<unknown>("/creators/me/payouts/request", {
    method: "POST",
    body: { amountJpy },
  });
}
