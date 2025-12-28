//front/src/shared/utils/statusLabels.ts

import type { AdminPayout } from "@/shared";



export function targetLabel(p: AdminPayout) {
  return p.targetType === 'SHOP' ? 'SHOP' : 'CREATOR';
}

export function targetName(p: AdminPayout) {
  if (p.targetType === 'SHOP') {
    return p.shop?.name ?? p.shopId ?? '-';
  }
  return p.creator?.publicName ?? p.creatorId ?? '-';
}