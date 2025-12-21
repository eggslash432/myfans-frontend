// front/src/pages/admin/domain/adminPostsView.ts

import type { AdminPost } from "../../../shared/types";

export type PostStatus = "draft" | "published" | "private";

// 投稿データ側の visibility（"all" は混ぜない）
export type PostVisibility = "free" | "plan" | "paid_single";

// フィルタUI側（"all" を含む）
export type VisibilityFilter = "all" | PostVisibility;

export type StatusFilter = "all" | PostStatus;

export type SortKey =
  | "createdAt"
  | "publishedAt"
  | "title"
  | "reportsCount"
  | "creatorName"
  | "status";

export function normalizeStatus(s: any): PostStatus {
  if (s === "published") return "published";
  if (s === "private") return "private";
  return "draft";
}

export function normalizeVisibility(v: any): PostVisibility {
  if (v === "plan") return "plan";
  if (v === "paid_single") return "paid_single";
  return "free";
}

export function creatorLabel(p: AdminPost): string {
  const name = (p as any).creatorName?.trim?.() ? (p as any).creatorName : "";
  if (name) return name;

  const creatorId = (p as any).creatorId;
  if (creatorId) return `(${String(creatorId).slice(0, 8)}…)`;

  return "管理者";
}

export function statusLabel(s: PostStatus) {
  if (s === "published") return "公開";
  if (s === "private") return "非公開";
  return "下書き";
}

export function visibilityLabel(v: PostVisibility) {
  if (v === "plan") return "プラン";
  if (v === "paid_single") return "PPV";
  return "無料";
}

// StatusBadge に渡す “合成status”
export function toPostBadgeStatus(p: AdminPost): string {
  const st = normalizeStatus((p as any).publishedStatus);
  const vis = normalizeVisibility((p as any).visibility);
  return `${st}:${vis}`; // 例: "published:plan"
}

function toTime(v: any) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function buildViewList(params: {
  list: AdminPost[];
  q: string;
  filterStatus: StatusFilter;
  filterVisibility: VisibilityFilter;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
}): AdminPost[] {
  const { list, q, filterStatus, filterVisibility, sortKey, sortDir } = params;

  const keyword = q.trim().toLowerCase();

  const filtered = (list ?? []).filter((p) => {
    const st = normalizeStatus((p as any).publishedStatus);
    if (filterStatus !== "all" && st !== filterStatus) return false;

    const vis = normalizeVisibility((p as any).visibility);
    if (filterVisibility !== "all" && vis !== filterVisibility) return false;

    if (!keyword) return true;

    const id = String((p as any).id ?? "").toLowerCase();
    const title = String((p as any).title ?? "").toLowerCase();
    const creator = String((p as any).creatorName ?? "").toLowerCase();

    return id.includes(keyword) || title.includes(keyword) || creator.includes(keyword);
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: string | number = 0;
    let bv: string | number = 0;

    if (sortKey === "createdAt") {
      av = toTime((a as any).createdAt);
      bv = toTime((b as any).createdAt);
    } else if (sortKey === "publishedAt") {
      av = toTime((a as any).publishedAt);
      bv = toTime((b as any).publishedAt);
    } else if (sortKey === "title") {
      av = String((a as any).title ?? "");
      bv = String((b as any).title ?? "");
    } else if (sortKey === "reportsCount") {
      av = Number((a as any).reportsCount ?? 0);
      bv = Number((b as any).reportsCount ?? 0);
    } else if (sortKey === "creatorName") {
      av = String((a as any).creatorName ?? "");
      bv = String((b as any).creatorName ?? "");
    } else if (sortKey === "status") {
      // published > private > draft
      const rank = (p: any) => {
        const st = normalizeStatus(p?.publishedStatus);
        if (st === "published") return 3;
        if (st === "private") return 2;
        return 1;
      };
      av = rank(a);
      bv = rank(b);
    }

    let cmp = 0;
    if (typeof av === "string" || typeof bv === "string") {
      cmp = String(av).localeCompare(String(bv), "ja");
    } else {
      cmp = (av ?? 0) - (bv ?? 0);
    }

    return sortDir === "asc" ? cmp : -cmp;
  });

  return sorted;
}
