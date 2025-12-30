// front/src/shared/types/domain/creators/analytics.ts
export type SimpleSummary = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};

export type RevenueTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  revenueJpy: number;
};

export type PostRevenueRow = {
  postId: string;
  title: string;
  revenueJpy: number;
  buyers: number;
};

export type SubscriberTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  newSubs: number;
  canceledSubs: number;
  net: number;
};
