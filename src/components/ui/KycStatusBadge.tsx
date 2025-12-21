// KycStatusBadge.tsx
import Badge, { type BadgeTone } from "@/components/ui/Badge";

type Props = {
  status: string | null;            // ✅ null許可
  disabledReason?: string | null;
};

function meta(status: string | null): { label: string; tone: BadgeTone } {
  if (status == null) return { label: "未開始", tone: "muted" };

  switch (status) {
    case "approved":
    case "verified":
      return { label: "承認済み", tone: "success" };
    case "pending":
      return { label: "審査中", tone: "warning" };
    case "rejected":
      return { label: "却下", tone: "danger" };
    case "restricted":
      return { label: "制限あり", tone: "warning" };
    case "incomplete":
      return { label: "未完了", tone: "muted" };
    default:
      return { label: status, tone: "muted" };
  }
}

export default function KycStatusBadge({ status, disabledReason }: Props) {
  const m = meta(status);

  // 必要なら tooltip に理由を出せる
  const title = disabledReason ?? undefined;

  return (
    <Badge tone={m.tone} title={title}>
      {m.label}
    </Badge>
  );
}
