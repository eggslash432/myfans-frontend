//front/src/shared/types/domain/admin/notifications.ts
import type { 
  NotificationSource,
  NotificationType,
} from "../../prisma";

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