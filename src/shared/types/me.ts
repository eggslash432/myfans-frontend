// front/src/shared/types/me.ts 
export type MeSummary = {
  /** 購読中プラン一覧 */
  subscriptions: Array<{
    id: string;
    planId: string;
    creatorId: string;
    planName?: string;
    priceJpy?: number;
    status?: 'active' | 'canceled' | 'past_due' | string;
    startedAt?: string;
    endedAt?: string | null;
  }>;

  /** 支払い履歴 */
  payments: Array<{
    id: string;
    amountJpy: number;
    currency?: string;
    status?: 'paid' | 'failed' | 'refunded' | string;
    createdAt: string;
    description?: string;
  }>;
};
