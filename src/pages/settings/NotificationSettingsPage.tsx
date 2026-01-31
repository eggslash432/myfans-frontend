// front/src/pages/settings/NotificationSettingsPage.tsx
import { useEffect, useState } from "react";
import {
  getNotificationSettings,
  updateNotificationSetting,
  type NotificationSetting,
  type NotificationType,
} from "@/features/settings";

const TYPE_LABEL: Record<NotificationType, string> = {
  SYSTEM: "システム通知",
  PAYMENT: "支払い・購入",
  KYC: "本人確認（KYC）",
  REPORT: "通報・モデレーション",
  POST: "投稿・コメント",
  ANNOUNCEMENT: "運営からのお知らせ",
  CREATOR: "クリエイター関連",
};

export function NotificationSettingsPage() {
  const [rows, setRows] = useState<NotificationSetting[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    getNotificationSettings().then((res) => setRows(res.data));
  }, []);

  if (!rows) return <div>Loading...</div>;

  const toggle = async (
    type: NotificationType,
    key: "inAppEnabled" | "emailEnabled",
  ) => {
    const current = rows.find((r) => r.type === type);
    if (!current) return;

    const nextValue = !current[key];

    // 楽観更新
    setRows((prev) =>
      prev!.map((r) =>
        r.type === type ? { ...r, [key]: nextValue } : r,
      ),
    );

    setSaving(type + key);
    try {
      const res = await updateNotificationSetting(type, {
        [key]: nextValue,
      });

      // サーバーの確定値で同期
      setRows((prev) =>
        prev!.map((r) => (r.type === type ? res.data : r)),
      );
    } finally {
      setSaving(null);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>通知設定</h1>
      <p style={{ color: "#666" }}>
        受け取りたい通知の種類と方法を設定できます。
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th align="left">種類</th>
            <th>アプリ内</th>
            <th>メール</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.type} style={{ borderTop: "1px solid #eee" }}>
              <td>{TYPE_LABEL[r.type]}</td>

              <td align="center">
                <input
                  type="checkbox"
                  checked={r.inAppEnabled}
                  disabled={saving !== null}
                  onChange={() => toggle(r.type, "inAppEnabled")}
                />
              </td>

              <td align="center">
                <input
                  type="checkbox"
                  checked={r.emailEnabled}
                  disabled={saving !== null}
                  onChange={() => toggle(r.type, "emailEnabled")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
