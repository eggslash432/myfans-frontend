// front/src/pages/admin/domain/adminPostsView.ts

import { 
  normalizeStatus,
  normalizeVisibility,
  toTime,
  type AdminPost, 
  type SortKey, 
  type StatusFilter,
  type VisibilityFilter
} from "@/shared";

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
