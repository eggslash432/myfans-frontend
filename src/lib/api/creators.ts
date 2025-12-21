// front/src/lib/api/creators.ts

import { request, apiGet } from '@/lib/api';
import type { 
  Creator, 
  CreatorAnalyticsMeResponse, 
  CreatorMeResponse, 
  CreatorPayoutBalanceResponse, 
  Payout, 
  PostSummary, 
  StartCreatorKycResponse, 
  UpdateCreatorProfileInput, 
  UploadCreatorAvatarResponse
} from '../../shared/types';

export function uploadCreatorAvatar(file: File): Promise<UploadCreatorAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return request<UploadCreatorAvatarResponse>('/creators/me/avatar', {
    method: 'POST',
    body: formData,
    json: false,
  });
}

export function getCreatorMe(): Promise<CreatorMeResponse> {
  return request<CreatorMeResponse>('/creators/me', { method: 'GET' });
}

export function updateCreatorProfile(
  data: UpdateCreatorProfileInput,
): Promise<CreatorMeResponse> {
  // 「更新後の me を返す」設計が多いので CreatorMeResponse を推奨
  // もし backend が { ok: true } とかならここを変える
  return request<CreatorMeResponse>('/creators/me', {
    method: 'PATCH',
    body: data,
  });
}

export function getCreatorPublicProfile(id: string): Promise<Creator> {
  return request<Creator>(`/creators/${id}`, { method: 'GET' });
}

export function getCreatorPosts(
  creatorId: string,
): Promise<{ items: PostSummary[] }> {
  return request<{ items: PostSummary[] }>(`/creators/${creatorId}/posts`, {
    method: 'GET',
  });
}

// ここが要注意：Creator[] なのか {items: Creator[]} なのかを決め打ちする必要がある
// もし今の API が配列返しなら Creator[]
export function listCreators(): Promise<Creator[]> {
  return request<Creator[]>('/creators', { method: 'GET' });
}

export function startCreatorKyc(): Promise<StartCreatorKycResponse> {
  return request<StartCreatorKycResponse>('/creators/me/kyc/start', {
    method: 'POST',
  });
}

// ==============================
// 後方互換（api_old.ts）
// ==============================

export function applyCreator(dto: { publicName: string }): Promise<CreatorMeResponse> {
  return request<CreatorMeResponse>('/creators/apply', {
    method: 'POST',
    body: dto,
  });
}

export function getCreatorPayoutSummary(): Promise<unknown> {
  return request<unknown>('/creators/me/payouts/summary', { method: 'GET' });
}

export function requestPayout(input: { amountJpy: number }): Promise<unknown> {
  return request<unknown>('/creators/me/payouts', {
    method: 'POST',
    body: input,
  });
}

export function getCreatorPayoutHistory(): Promise<unknown> {
  return request<unknown>('/creators/me/payouts/history', { method: 'GET' });
}



export function getCreatorPayoutBalance(): Promise<CreatorPayoutBalanceResponse> {
  return request<CreatorPayoutBalanceResponse>('/creators/me/payouts/balance', {
    method: 'GET',
  });
}

export function listCreatorPayouts(): Promise<Payout[]> {
  return request<Payout[]>('/creators/me/payouts', { method: 'GET' });
}

export function requestCreatorPayout(amountJpy: number): Promise<unknown> {
  return request<unknown>('/creators/me/payouts/request', {
    method: 'POST',
    body: { amountJpy },
  });
}

export async function createStripeOnboardingLink(): Promise<{ url: string }> {
  // ★既存APIを使う
  return request<{ url: string }>("/creators/me/kyc/start", { method: "POST" });
}

export function creatorAnalyticsMe(): Promise<CreatorAnalyticsMeResponse> {
  return request<CreatorAnalyticsMeResponse>('/creators/me/analytics', {
    method: 'GET',
  });
}

// 例: apiClient.getが { data } を返す前提
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