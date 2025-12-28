import { request } from "@/lib/api";
import type { KycStatus, PendingCreator } from "@/shared";

export function adminListCreators(params?: {
  isListed?: boolean;
  kycStatus?: KycStatus;
}): Promise<PendingCreator[]> {
  const qs = new URLSearchParams();
  if (typeof params?.isListed === "boolean") qs.set("isListed", String(params.isListed));
  if (params?.kycStatus) qs.set("kycStatus", params.kycStatus);
  const q = qs.toString();
  return request<PendingCreator[]>(`/admin/creators${q ? `?${q}` : ""}`);
}

/** クリエイター掲載ON/OFF（返り値を使わないなら void） */
export function adminSetCreatorListing(userId: string, isListed: boolean): Promise<void> {
  return request<void>(`/admin/creators/${userId}/listing`, {
    method: "PATCH",
    body: { isListed },
  });
}
