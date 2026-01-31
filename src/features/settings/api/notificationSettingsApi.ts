// front/src/features/settings/api/notificationSettingsApi.ts
import { apiGet, apiPatch } from "@/lib/api/axiosLike";

export type NotificationType =
  | "SYSTEM"
  | "PAYMENT"
  | "KYC"
  | "REPORT"
  | "POST"
  | "ANNOUNCEMENT"
  | "CREATOR";

export type NotificationSetting = {
  id: string;
  type: NotificationType;
  inAppEnabled: boolean;
  emailEnabled: boolean;
};

export async function getNotificationSettings() {
  return apiGet<NotificationSetting[]>("/me/notification-settings");
}

export async function updateNotificationSetting(
  type: NotificationType,
  patch: Partial<Pick<NotificationSetting, "inAppEnabled" | "emailEnabled">>,
) {
  // 👇 apiPatch を使う
  return apiPatch<NotificationSetting>(
    `/me/notification-settings/${type}`,
    patch,
  );
}
