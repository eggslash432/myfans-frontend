// front/src/components/ui/StatusBadge.tsx

import type { Visibility, PublishedStatus } from "../../shared/prisma-enums";

type Props = {
  publishedStatus: PublishedStatus;
  visibility?: Visibility | null;
  className?: string;
};

function statusText(publishedStatus: PublishedStatus) {
  if (publishedStatus === "published") return "公開";
  if (publishedStatus === "draft") return "下書き";
  return "非公開";
}

function visibilityText(v?: Visibility | null) {
  if (!v) return "";
  if (v === "free") return "無料";
  if (v === "plan") return "プラン限定";
  if (v === "paid_single") return "単品購入";
  return String(v);
}

/** 状態→色（バッジ用クラス） */
function statusTone(publishedStatus: PublishedStatus) {
  if (publishedStatus === "published") return "badge-success";
  if (publishedStatus === "draft") return "badge-muted";
  return "badge-warning"; // 非公開
}

/** visibility は薄い補助バッジにする */
function visibilityTone(v?: Visibility | null) {
  if (!v) return "badge-muted";
  if (v === "free") return "badge-muted";
  if (v === "plan") return "badge-info";
  if (v === "paid_single") return "badge-info";
  return "badge-muted";
}

export default function StatusBadge({ publishedStatus, visibility, className }: Props) {
  const s = statusText(publishedStatus);
  const v = visibilityText(visibility);

  return (
    <div className={`badges ${className ?? ""}`.trim()}>
      <span className={`badge ${statusTone(publishedStatus)}`}>{s}</span>
      {v && <span className={`badge ${visibilityTone(visibility)}`}>{v}</span>}
    </div>
  );
}
