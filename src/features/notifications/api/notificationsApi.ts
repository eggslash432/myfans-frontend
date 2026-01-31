//front/src/features/notifications/api/notificationsApi.ts

import { apiGet, apiPatch } from "@/lib/api/axiosLike";

export type MeNotification = {
  id: string;
  type: string;
  source: string | null;
  title: string;
  body: string;
  readAt: string | null;     // APIは Date を返すはずなので string 扱いに（必要なら変換）
  createdAt: string;
};

export type ListRes = {
  items: MeNotification[];
  total: number;
};

export function getMyNotifications(params?: {
  unreadOnly?: boolean;
  take?: number;
  skip?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.unreadOnly) qs.set("unreadOnly", "true");
  if (params?.take != null) qs.set("take", String(params.take));
  if (params?.skip != null) qs.set("skip", String(params.skip));
  const q = qs.toString();
  return apiGet<ListRes>(`/me/notifications${q ? `?${q}` : ""}`);
}

export function markNotificationRead(id: string) {
  return apiPatch<MeNotification>(`/me/notifications/${id}/read`);
}

export async function getUnreadCount() {
  const res = await getMyNotifications({ unreadOnly: true, take: 1, skip: 0 });
  return res.data.total;
}
