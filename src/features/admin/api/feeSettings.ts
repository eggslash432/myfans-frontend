import { request } from "@/lib/api";
import type { FeeSettings } from "@/shared";

export function adminGetFeeSettings(): Promise<FeeSettings> {
  return request<FeeSettings>("/admin/settings/fees");
}

export function adminUpdateFeeSettings(payload: FeeSettings): Promise<FeeSettings> {
  return request<FeeSettings>("/admin/settings/fees", {
    method: "PATCH",
    body: payload,
  });
}
