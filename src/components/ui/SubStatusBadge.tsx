// front/src/components/ui/SubStatusBadge.tsx

import { Badge } from "@/components";
import type { BadgeTone } from "@/shared";

type SubStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused"
  | string;

function meta(status: SubStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case "active":
      return { label: "有効", tone: "success" };
    case "trialing":
      return { label: "トライアル", tone: "info" };
    case "past_due":
      return { label: "支払遅延", tone: "warning" };
    case "unpaid":
      return { label: "未払い", tone: "danger" };
    case "canceled":
      return { label: "解約", tone: "muted" };
    case "paused":
      return { label: "停止中", tone: "muted" };
    case "incomplete":
      return { label: "未完了", tone: "warning" };
    case "incomplete_expired":
      return { label: "期限切れ", tone: "muted" };
    default:
      return { label: status, tone: "muted" };
  }
}

export function SubStatusBadge({ status }: { status: SubStatus }) {
  const m = meta(status);
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
