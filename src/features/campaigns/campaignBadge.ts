// front/src/components/features/campaigns/campaignBadge.ts
import { 
  isActiveNow, 
  type Announcement 
} from "@/shared";

export function campaignBadgeClass(a: Announcement) {
  if (isActiveNow(a)) return "badge badge-success";
  if (a.isEnabled) return "badge badge-warning";
  return "badge badge-muted";
}



export function campaignBadgeText(a: Announcement) {
  if (isActiveNow(a)) return "公開中";
  if (a.isEnabled) return "待機/終了";
  return "無効";
}
