// front/src/pages/creators/CreatorPlansPage/creatorPlans.types.ts
import type { CreatorMeResponse } from "../../../shared/types";

export function unwrapCreator(res: any): CreatorMeResponse | null {
  const c = res?.data ?? res?.creator ?? res?.item ?? res;
  const ok =
    c &&
    typeof c === "object" &&
    (typeof c.id === "string" || typeof c.approvalStatus === "string");
  return ok ? (c as CreatorMeResponse) : null;
}

export function friendlyCreatorPlansError(err: string) {
  return err === "creatorId is required"
    ? "クリエイター登録または本人確認（KYC）が完了していないため、プラン情報を取得できません。"
    : err;
}
