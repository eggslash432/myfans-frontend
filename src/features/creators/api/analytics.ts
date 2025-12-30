// front/src/features/creators/api/analytics.ts
import { request, apiGet } from "@/lib/api";
import type { CreatorAnalyticsMeResponse } from "@/types";

export function creatorAnalyticsMe(): Promise<CreatorAnalyticsMeResponse> {
  return request<CreatorAnalyticsMeResponse>("/creators/me/analytics", { method: "GET" });
}

export async function creatorAnalyticsRevenueTrend(params: {
  granularity: "day" | "month";
  from?: string;
  to?: string;
}) {
  const qs = new URLSearchParams();
  qs.set("granularity", params.granularity);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const res = await apiGet(`/creators/analytics/me/revenue-trend?${qs.toString()}`);
  return res.data as { points: Array<{ date: string; revenueJpy: number }> };
}

export async function creatorAnalyticsPostRanking(params: {
  from?: string;
  to?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.limit != null) qs.set("limit", String(params.limit));

  const res = await apiGet(`/creators/analytics/me/post-ranking?${qs.toString()}`);
  return res.data as {
    items: Array<{ postId: string; title: string; revenueJpy: number; buyers: number }>;
  };
}

export async function creatorAnalyticsSubscriberTrend(params: {
  granularity: "day" | "month";
  from?: string;
  to?: string;
}) {
  const qs = new URLSearchParams();
  qs.set("granularity", params.granularity);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);

  const res = await apiGet(`/creators/analytics/me/subscriber-trend?${qs.toString()}`);
  return res.data as {
    points: Array<{ date: string; newSubs: number; canceledSubs: number; net: number }>;
  };
}
