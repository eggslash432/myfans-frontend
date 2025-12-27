// front/src/pages/admin/announcements/AdminAnnouncementsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  adminCreateAnnouncement,
  adminDeleteAnnouncement,
  adminListAnnouncements,
  adminUpdateAnnouncement,
  type Announcement,
} from "@/lib/api";
import { AnnouncementTable } from "./AnnouncementTable";
import { AnnouncementEditModal } from "./AnnouncementEditModal";
import { fromLocalInputValue, isActiveNow, toLocalInputValue } from "./announcementUtils";
import { emptyEdit, type EditState } from "./types";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await adminListAnnouncements();
      setItems(res.data.items);
    } catch (e) {
      console.error(e);
      setErr("告知一覧の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void load(), []);

  const activeCount = useMemo(() => items.filter(isActiveNow).length, [items]);

  const openEdit = (a: Announcement) =>
    setEditing({
      id: a.id,
      title: a.title ?? "",
      body: a.body ?? "",
      linkUrl: a.linkUrl ?? "",
      bannerImageUrl: a.bannerImageUrl ?? "",
      startsAt: toLocalInputValue(a.startsAt),
      endsAt: toLocalInputValue(a.endsAt),
      isEnabled: !!a.isEnabled,
    });

  const onSave = async () => {
    if (!editing) return;

    const title = editing.title.trim();
    const body = editing.body.trim();
    if (!title) return alert("タイトルを入力してください。");
    if (!body) return alert("本文を入力してください。");

    const startsAt = fromLocalInputValue(editing.startsAt);
    const endsAt = fromLocalInputValue(editing.endsAt);
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      return alert("開始日時は終了日時以前にしてください。");
    }

    const payload = {
      title,
      body,
      linkUrl: editing.linkUrl.trim() || null,
      bannerImageUrl: editing.bannerImageUrl.trim() || null,
      startsAt,
      endsAt,
      isEnabled: editing.isEnabled,
    };

    try {
      setSaving(true);
      if (editing.id) await adminUpdateAnnouncement(editing.id, payload);
      else await adminCreateAnnouncement(payload);
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);

      let msg = "保存に失敗しました。";

      if (e instanceof Error && e.message) {
        msg = e.message;
      } else if (typeof e === "object" && e !== null) {
        const anyE = e as any;
        msg =
          anyE?.response?.data?.message ||
          anyE?.data?.message ||
          anyE?.message ||
          msg;
      }

      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (a: Announcement) => {
    if (!confirm(`「${a.title}」を削除しますか？`)) return;
    try {
      await adminDeleteAnnouncement(a.id);
      await load();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました。");
    }
  };

  return (
    <div className="page space-y-4">
      <section className="card">
        <div className="admin-filter-head">
          <div>
            <div className="section-title">キャンペーン告知</div>
            <div className="section-subtitle">公開中: {activeCount} 件</div>
          </div>

          <div className="admin-filter-actions">
            <button className="btn btn-primary" onClick={() => setEditing(emptyEdit())}>
              新規作成
            </button>
            <button className="btn btn-ghost" onClick={load} disabled={loading}>
              再読み込み
            </button>
          </div>
        </div>

        {err && <div className="auth-error">{err}</div>}
      </section>

      {loading ? (
        <section className="card">
          <div className="section-subtitle">読み込み中...</div>
        </section>
      ) : (
        <AnnouncementTable items={items} onEdit={openEdit} onDelete={onDelete} />
      )}

      {editing && (
        <AnnouncementEditModal
          editing={editing}
          saving={saving}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
