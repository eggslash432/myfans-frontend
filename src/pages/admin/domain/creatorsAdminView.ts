// front/src/pages/admin/domain/creatorsAdminView.ts
import type { CreatorApplication, CreatorApprovalStatus } from "@/shared";

export type CreatorApprovalStatusFilter = CreatorApprovalStatus | "all";

export function statusLabel(s: CreatorApprovalStatusFilter) {
  if (s === "pending") return "審査中";
  if (s === "approved") return "承認済み";
  if (s === "rejected") return "却下";
  return "全て";
}

export function badgeClass(s: CreatorApprovalStatus) {
  if (s === "pending") return "badge badge-warning";
  if (s === "approved") return "badge badge-success";
  return "badge badge-red";
}

export function filterByKeyword(list: CreatorApplication[], q: string) {
  const keyword = q.trim().toLowerCase();
  if (!keyword) return list;

  return list.filter((x) => {
    return (
      (x.email ?? "").toLowerCase().includes(keyword) ||
      (x.publicName ?? "").toLowerCase().includes(keyword) ||
      (x.displayName ?? "").toLowerCase().includes(keyword)
    );
  });
}
