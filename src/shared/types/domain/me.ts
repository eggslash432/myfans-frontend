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
    status: SubStatus;
    currentPeriodStart: string; // ISO
    currentPeriodEnd: string;   // ISO
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;

    plan?: {
      id: string;
      name: string;
      priceJpy: number;
      billingInterval: 'month' | 'year';
    };

    creator?: {
      userId: string;
      publicName: string;
    };
  }>;

  /** 支払い履歴 */
  payments: Array<{
    id: string;
    amountJpy: number;
    kind: 'subscription' | 'one_time';
    paymentStatus: PaymentStatus;
    paidAt?: string | null;
    createdAt: string;

    plan?: {
      id: string;
      name: string;
    } | null;

    post?: {
      id: string;
      title: string;
    } | null;

    creator?: {
      userId: string;
      publicName: string;
    } | null;
  }>;
};

