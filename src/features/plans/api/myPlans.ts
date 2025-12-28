// front/src/features/plans/api/myPlans.ts
import { request } from "@/lib/api";
import type { PlansResponse, CreatePlanPayload, UpdatePlanPayload } from "@/shared/types";

export function getMyPlans(): Promise<PlansResponse> {
  return request<PlansResponse>("/plans/me");
}

export function createPlan(payload: CreatePlanPayload): Promise<unknown> {
  return request("/plans", { method: "POST", body: payload });
}

export function updatePlan(id: string, payload: UpdatePlanPayload): Promise<unknown> {
  return request(`/plans/${id}`, { method: "PATCH", body: payload });
}

export function deactivatePlan(id: string): Promise<unknown> {
  return request(`/plans/${id}`, { method: "DELETE" });
}
