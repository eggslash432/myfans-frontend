//front/src/shared/utils/creators.ts

import type { 
  AdminPost, 
  CreatorApprovalStatus, 
  CreatorApprovalStatusFilter, 
  CreatorMeResponse 
} from "../types";

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

export function isCreatorNotFoundError(msg: string) {
  return (msg ?? "").toLowerCase().includes("creator not found");
}

export function creatorLabel(p: AdminPost): string {
  const name = (p as any).creatorName?.trim?.() ? (p as any).creatorName : "";
  if (name) return name;

  const creatorId = (p as any).creatorId;
  if (creatorId) return `(${String(creatorId).slice(0, 8)}…)`;

  return "管理者";
}

export function creatorApprovalStatusLabel(s: CreatorApprovalStatusFilter) {
  if (s === "pending") return "審査中";
  if (s === "approved") return "承認済み";
  if (s === "rejected") return "却下";
  return "全て";
}

export function creatorApprovalBadgeClass(s: CreatorApprovalStatus) {
  if (s === "pending") return "badge badge-warning";
  if (s === "approved") return "badge badge-success";
  return "badge badge-red";
}