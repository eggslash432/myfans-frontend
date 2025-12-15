// front/src/shared/types/me.ts 
import type { PaymentStatus, Role, SubStatus } from "../prisma-enums";

export type Me = { 
  id: string; 
  email: string; 
  role: Role; 
};

// マイページ・設定用
export type UserMe = {
  id: string;
  email: string;
  role: string;
  profile?: {
    displayName?: string;
    avatarUrl?: string;
  };
  creator?: {
    id: string;
    status: string;
  };
};

export type MeSummary = {
  /** 購読中プラン一覧 */
  subscriptions: Array<{
    id: string;
    planId: string;
    creatorId: string;
    planName?: string;
    priceJpy?: number;
    status?: SubStatus;
    startedAt?: string;
    endedAt?: string | null;
  }>;

  /** 支払い履歴 */
  payments: Array<{
    id: string;
    amountJpy: number;
    currency?: string;
    status?: PaymentStatus;
    createdAt: string;
    description?: string;
  }>;
};
