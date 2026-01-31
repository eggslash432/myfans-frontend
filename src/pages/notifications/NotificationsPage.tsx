// front/src/pages/notifications/NotificationsPage.tsx

import { useEffect, useMemo, useState } from "react";
import {
  getMyNotifications,
  markNotificationRead,
  type MeNotification,
} from "@/features/notifications";

function fmt(dt?: string | null) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return String(dt);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d
    .getHours()
    .toString()
    .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<MeNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const take = 50;
  const skip = 0;

  const unreadCount = useMemo(
    () => items.filter((x) => !x.readAt).length,
    [items],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications({ unreadOnly, take, skip });
      setItems(res.data.items);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadOnly]);

  const onRead = async (id: string) => {
    // 先に楽観的に既読にする
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );

    try {
      const res = await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    } catch (e) {
      // 失敗したら再読込（戻すの面倒ならこれが安全）
      await load();
      throw e;
    }
  };

  return (
    <div style={{ maxWidth: 820 }}>
      <h1>通知</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "12px 0" }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          未読のみ
        </label>

        <span style={{ color: "#666" }}>
          全 {total} 件 / 表示 {items.length} 件（未読 {unreadCount} 件）
        </span>
      </div>

      {loading && <div>Loading...</div>}

      {!loading && items.length === 0 && (
        <div style={{ color: "#666" }}>通知はありません</div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((n) => (
          <div
            key={n.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 10,
              padding: 12,
              background: n.readAt ? "white" : "#fff7e6",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 700 }}>{n.title}</div>
              <div style={{ color: "#666", whiteSpace: "nowrap" }}>{fmt(n.createdAt)}</div>
            </div>

            <div style={{ color: "#666", marginTop: 4 }}>
              {n.type} {n.source ? `/${n.source}` : ""}
            </div>

            <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{n.body}</div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              {!n.readAt ? (
                <button onClick={() => onRead(n.id)}>既読にする</button>
              ) : (
                <span style={{ color: "#666" }}>既読</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
