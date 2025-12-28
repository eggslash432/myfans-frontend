import { request } from "@/lib/api";
import type { UploadSetting } from "@/shared";

export function adminGetUploadSettings(): Promise<UploadSetting> {
  return request<UploadSetting>("/admin/settings/upload");
}

export function adminUpdateUploadSettings(input: UploadSetting): Promise<{ ok: true }> {
  return request<{ ok: true }>("/admin/settings/upload", {
    method: "PATCH",
    body: input,
  });
}
