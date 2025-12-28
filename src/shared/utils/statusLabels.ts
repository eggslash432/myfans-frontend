//front/src/shared/utils/statusLabels.ts

import type { AdminPayout } from "@/shared";

export function approvalStatusLabel(s: string) {
  switch (s) {
    case 'requested': return '申請中';
    case 'approved': return '承認済み';
    case 'paid': return '送金済み';
    case 'rejected': return '却下';
    default: return s;
  }
}

export function targetLabel(p: AdminPayout) {
  return p.targetType === 'SHOP' ? 'SHOP' : 'CREATOR';
}

export function targetName(p: AdminPayout) {
  if (p.targetType === 'SHOP') {
    return p.shop?.name ?? p.shopId ?? '-';
  }
  return p.creator?.publicName ?? p.creatorId ?? '-';
}