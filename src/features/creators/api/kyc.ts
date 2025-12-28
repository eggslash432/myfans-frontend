// front/src/features/creators/api/kyc.ts
import { request } from "@/lib/api";
import type { StartCreatorKycResponse } from "@/shared/types";

export function startCreatorKyc(): Promise<StartCreatorKycResponse> {
  return request<StartCreatorKycResponse>("/creators/me/kyc/start", { method: "POST" });
}

/** 互換：URLだけ欲しい呼び出し用（中身は startCreatorKyc に寄せる） */
export async function createStripeOnboardingLink(): Promise<{ url: string }> {
  const res = await startCreatorKyc();
  // StartCreatorKycResponse が {url:string} ならそのまま返せる
  // もし { data: { url } } 等ならここで変換
  return res as unknown as { url: string };
}
