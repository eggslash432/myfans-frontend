//front/src/shared/utils/creators.ts

import type { CreatorMeResponse } from "@/shared";

export function unwrapCreator(res: any): CreatorMeResponse | null {
  const c = res?.data ?? res?.creator ?? res?.item ?? res;

  if (
    !c ||
    typeof c !== "object" ||
    (typeof (c as any).id !== "string" &&
     typeof (c as any).approvalStatus !== "string")
  ) {
    return null;
  }

  return c as CreatorMeResponse;
}

export function friendlyCreatorPlansError(err: string) {
  return err === "creatorId is required"
    ? "クリエイター登録または本人確認（KYC）が完了していないため、プラン情報を取得できません。"
    : err;
}