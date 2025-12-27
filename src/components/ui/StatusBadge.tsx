// front/src/components/ui/StatusBadge.tsx

// StatusBadge.tsx
import { Badge } from "@/components";
import type { BadgeTone } from "@/shared";

/**
 * ここは “何でもバッジ” として使い回す前提
 * まずは creator申請(pending/approved/rejected) と
 * 既存で使ってる free/plan/ppv/published などに対応しておく
 */
type AnyStatus = string;

function meta(status: AnyStatus): { label: string; tone: BadgeTone } {
  // ---- creator application ----
  if (status === "pending") return { label: "承認待ち", tone: "warning" };
  if (status === "approved") return { label: "承認済み", tone: "success" };
  if (status === "rejected") return { label: "却下", tone: "danger" };

  // ---- visibility / content ----
  if (status === "free") return { label: "無料", tone: "success" };
  if (status === "plan") return { label: "プラン", tone: "info" };
  if (status === "ppv") return { label: "PPV", tone: "warning" };

  // ---- published status ----
  if (status === "published") return { label: "公開", tone: "success" };
  if (status === "draft") return { label: "下書き", tone: "muted" };
  if (status === "scheduled") return { label: "予約", tone: "info" };
  if (status === "archived") return { label: "非公開", tone: "muted" };

  return { label: status, tone: "muted" };
}

export function StatusBadge({ status }: { status: AnyStatus }) {
  const m = meta(status);
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

