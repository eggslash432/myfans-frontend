// front/src/components/features/admin/AdminNotificationsList.tsx
import type { AdminNotifRow } from "@/lib/api";
import { fmt } from "@/shared";

export function AdminNotificationsList(props: {
  items: AdminNotifRow[];
  onClickUnread: (id: string) => void;
}) {
  const { items, onClickUnread } = props;

  return (
    <div style={{ marginTop: 12 }}>
      {items.map((r) => (
        <div
          key={r.id}
          className="card"
          style={{ marginBottom: 10, cursor: r.readAt ? "default" : "pointer" }}
          title={r.readAt ? "" : "クリックで既読化（暫定）"}
          onClick={() => {
            if (!r.readAt) onClickUnread(r.id);
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>
              {!r.readAt ? "🟡 " : "⚪️ "}
              {r.title}
            </div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{fmt(r.createdAt)}</div>
          </div>

          <div style={{ marginTop: 6, opacity: 0.85, fontSize: 12 }}>
            userId: {r.userId} / type: {r.type} / source: {r.source ?? "-"} / read:{" "}
            {r.readAt ? "yes" : "no"}
          </div>

          <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.body}</div>
        </div>
      ))}
    </div>
  );
}
