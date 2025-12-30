//front/src/features/creators/domain/creatorsUiLabels.ts
import type { 
  AdminPost, 
  CreatorApprovalStatus, 
  CreatorApprovalStatusFilter, 
} from "@/types";

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