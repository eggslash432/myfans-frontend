// front/src/features/creators/api/me.ts
import { request } from "@/lib/api";
import type {
  CreatorMeResponse,
  UpdateCreatorProfileInput,
  UploadCreatorAvatarResponse,
} from "@/shared/types";

export function uploadCreatorAvatar(file: File): Promise<UploadCreatorAvatarResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return request<UploadCreatorAvatarResponse>("/creators/me/avatar", {
    method: "POST",
    body: formData,
    json: false,
  });
}

export function getCreatorMe(): Promise<CreatorMeResponse> {
  return request<CreatorMeResponse>("/creators/me", { method: "GET" });
}

export function updateCreatorProfile(data: UpdateCreatorProfileInput): Promise<CreatorMeResponse> {
  return request<CreatorMeResponse>("/creators/me", {
    method: "PATCH",
    body: data,
  });
}
