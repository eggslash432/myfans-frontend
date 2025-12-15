// front/src/lib/api/plans.ts

import { request } from './apiClient';
import type { 
  PlansResponse, 
  CreatePlanPayload, 
  UpdatePlanPayload 
} from '../../shared/types';

export function getMyPlans(): Promise<PlansResponse> {
  return request('/plans/me');
}

export function createPlan(payload: CreatePlanPayload) {
  return request('/plans', { method: 'POST', body: payload });
}

export function updatePlan(id: string, payload: UpdatePlanPayload) {
  return request(`/plans/${id}`, { method: 'PATCH', body: payload });
}

export function deactivatePlan(id: string) {
  return request(`/plans/${id}`, { method: 'DELETE' });
}

//
// ==============================
// 後方互換（api_old.ts）
// ==============================

/** クリエイターの公開プラン一覧（旧: getCreatorPlans） */
export function getCreatorPlans(creatorId: string): Promise<PlansResponse> {
  const qs = new URLSearchParams({ creatorId });
  return request(`/plans?${qs.toString()}`);
}

/** 単一プラン取得（旧: getPlan） */
export function getPlan(planId: string) {
  return request(`/plans/${planId}`);
}

/** プラン並び替え（旧: reorderPlans） */
export function reorderPlans(planIds: string[]) {
  return request('/plans/reorder', {
    method: 'PATCH',
    body: { planIds },
  });
}

/** 非公開→再公開（旧: reactivatePlan） */
export function reactivatePlan(planId: string) {
  return request(`/plans/${planId}/reactivate`, {
    method: 'PATCH',
    body: {}, // JSON送信の形を保つ
  });
}