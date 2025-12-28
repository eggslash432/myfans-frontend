import { request } from "@/lib/api";
import type { AdminNotifListParams, AdminNotifListRes, NotificationType } from "@/shared";

export function adminListNotifications(params: AdminNotifListParams): Promise<AdminNotifListRes> {
  const qs = new URLSearchParams();
  if (params.userId) qs.set("userId", params.userId);
  if (params.type) qs.set("type", params.type);
  if (params.source) qs.set("source", params.source);
  if (params.unreadOnly) qs.set("unreadOnly", "true");
  qs.set("take", String(params.take));
  qs.set("skip", String(params.skip));

  return request<AdminNotifListRes>(`/admin/notifications?${qs.toString()}`, { method: "GET" });
}

// 既存API（暫定）が /notifications/:id/read ならそのまま踏む
export function markNotificationAsRead(id: string): Promise<void> {
  return request<void>(`/notifications/${id}/read`, { method: "POST" });
}

export function adminSendNotification(payload: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
}): Promise<void> {
  return request<void>("/admin/notifications/send", {
    method: "POST",
    body: payload,
  });
}
