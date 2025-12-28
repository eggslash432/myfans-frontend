// front/src/features/shops/api/creatorApplications.ts
import { request } from "@/lib/api";
import type {
  ShopCreatorApplication,
  ShopCreatorApplicationsRes,
  ShopCreatorApplicationStatus,
} from "@/shared";
import { USE_MOCK, mockCreatorApplications } from "./mock";

/**
 * 自分の所属Shopの「Creator申請一覧」
 * GET /shops/creator-applications
 */
export async function getShopCreatorApplications(): Promise<ShopCreatorApplication[]> {
  if (USE_MOCK) return mockCreatorApplications();
  return request<ShopCreatorApplication[]>("/shops/creator-applications", { method: "GET" });
}

export async function shopListCreatorApplications(params?: {
  status?: ShopCreatorApplicationStatus;
  take?: number;
  cursor?: string;
}): Promise<ShopCreatorApplicationsRes> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.take != null) qs.set("take", String(params.take));
  if (params?.cursor) qs.set("cursor", params.cursor);

  const url = qs.toString()
    ? `/shops/creator-applications?${qs.toString()}`
    : "/shops/creator-applications";

  return request<ShopCreatorApplicationsRes>(url, { method: "GET" });
}
