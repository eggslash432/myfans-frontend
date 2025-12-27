// front/src/lib/api/admin/adminNotifications.ts
import type { NotificationSource, NotificationType } from "@/shared/prisma-enums";

export type AdminNotifRow = {
  id: string;
  userId: string;
  type: NotificationType;
  source: NotificationSource | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotifListParams = {
  userId?: string;
  type?: NotificationType;
  source?: NotificationSource;
  unreadOnly?: boolean;
  take: number;
  skip: number;
};

export type AdminNotifListRes = {
  items: AdminNotifRow[];
  total?: number;
};

export async function adminListNotifications(params: AdminNotifListParams): Promise<AdminNotifListRes> {
  const qs = new URLSearchParams();
  if (params.userId) qs.set("userId", params.userId);
  if (params.type) qs.set("type", params.type);
  if (params.source) qs.set("source", params.source);
  if (params.unreadOnly) qs.set("unreadOnly", "true");
  qs.set("take", String(params.take));
  qs.set("skip", String(params.skip));

  const res = await fetch(`/api/admin/notifications?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as AdminNotifListRes;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  // 暫定：既存API
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function adminSendNotification(payload: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
}): Promise<void> {
  const res = await fetch(`/api/admin/notifications/send`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
