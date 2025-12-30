// front/src/shared/types/domain/shops/invites.ts
import type { ShopMemberRole } from "@/shared";

export type ShopInvite = {
  code: string;
  role: ShopMemberRole;
  expiresAt?: string | null;
};
