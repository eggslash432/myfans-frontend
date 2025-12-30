// front/src/features/payouts/domain/payoutsUtils.ts
import type { PayoutStatus } from "@/types";

export function renderPayoutStatusLabel(s: PayoutStatus) {
  switch (s) {
    case "requested":
      return "申請中";
    case "approved":
      return "承認済（振込待ち）";
    case "paid":
      return "振込済み";
    case "rejected":
      return "却下";
    default:
      return String(s);
  }
}
