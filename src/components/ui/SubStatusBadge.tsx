// front/src/components/ui/SubStatusBadge.tsx

import type { SubStatus } from "../../shared/prisma-enums";

export default function SubStatusBadge({ status }: { status: SubStatus }) {
  const cls =
    status === "active"
      ? "badge badge-green"
      : status === "trialing"
      ? "badge badge-blue"
      : status === "past_due"
      ? "badge badge-yellow"
      : "badge badge-gray";

  return <span className={cls}>{status}</span>;
}
