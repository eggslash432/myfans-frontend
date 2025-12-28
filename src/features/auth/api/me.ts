// front/src/features/auth/api/me.ts
import { request } from "@/lib/api";
import type { Me, MeSummary } from "@/shared";

export function getMe(): Promise<Me> {
  return request<Me>("/auth/me");
}

export function getUserMe(): Promise<MeSummary> {
  return request<MeSummary>("/auth/me/summary");
}
