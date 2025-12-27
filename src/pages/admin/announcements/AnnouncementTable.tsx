// front/src/pages/admin/announcements/AnnouncementTable.tsx
import type { Announcement } from "@/lib/api";
import { isActiveNow } from "./announcementUtils";

const badgeClass = (a: Announcement) => {
  if (isActiveNow(a)) return "badge badge-success";
  if (a.isEnabled) return "badge badge-warning";
  return "badge badge-muted";
};

const badgeText = (a: Announcement) => {
  if (isActiveNow(a)) return "公開中";
  if (a.isEnabled) return "待機/終了";
  return "無効";
};

export function AnnouncementTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Announcement[];
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
}) {
  return (
    <div className="card">
      {items.length === 0 ? (
        <div className="section-subtitle">告知がまだありません。</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>状態</th>
                <th>タイトル</th>
                <th style={{ width: 260 }}>期間</th>
                <th style={{ width: 180 }}>更新</th>
                <th style={{ width: 180 }} />
              </tr>
            </thead>

            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className={badgeClass(a)}>{badgeText(a)}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 800 }}>{a.title}</div>
                    {a.bannerImageUrl && (
                      <div className="section-subtitle">バナー: {a.bannerImageUrl}</div>
                    )}
                    {a.linkUrl && (
                      <div className="section-subtitle">リンク: {a.linkUrl}</div>
                    )}
                  </td>

                  <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    <div>開始: {a.startsAt ? new Date(a.startsAt).toLocaleString() : "未設定"}</div>
                    <div>終了: {a.endsAt ? new Date(a.endsAt).toLocaleString() : "未設定"}</div>
                  </td>

                  <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                    {new Date(a.updatedAt).toLocaleString()}
                  </td>

                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => onEdit(a)}>
                        編集
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => onDelete(a)}>
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
