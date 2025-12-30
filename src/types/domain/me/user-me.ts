import type { CreatorApprovalStatus, Role } from "@/shared/prisma-enums";

// front/src/shared/types/domain/me/user-me.ts
export type UserMe = {
  id: string;
  email: string;
  role: Role; // ※APIがRole返すなら Role に変更推奨
  profile?: {
    displayName?: string;
    avatarUrl?: string;
  };
  creator?: {
    id: string;
    status: CreatorApprovalStatus;
  };
};
