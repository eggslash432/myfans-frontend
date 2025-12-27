// front/src/pages/admin/announcements/AnnouncementEditModal.tsx
import type { EditState } from "./types";

export function AnnouncementEditModal({
  editing,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  editing: EditState;
  saving: boolean;
  onChange: (next: EditState) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card2" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editing.id ? "告知を編集" : "告知を新規作成"}</div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className="modal-body">
          <label>
            <div className="modal-label">タイトル</div>
            <input
              className="modal-input"
              value={editing.title}
              onChange={(e) => onChange({ ...editing, title: e.target.value })}
            />
          </label>

          <label>
            <div className="modal-label">本文（テキスト告知）</div>
            <textarea
              className="modal-textarea"
              value={editing.body}
              onChange={(e) => onChange({ ...editing, body: e.target.value })}
            />
          </label>

          <label>
            <div className="modal-label">リンクURL（任意）</div>
            <input
              className="modal-input"
              value={editing.linkUrl}
              onChange={(e) => onChange({ ...editing, linkUrl: e.target.value })}
              placeholder="https://..."
            />
          </label>

          <label>
            <div className="modal-label">バナー画像URL（任意）</div>
            <input
              className="modal-input"
              value={editing.bannerImageUrl}
              onChange={(e) => onChange({ ...editing, bannerImageUrl: e.target.value })}
              placeholder="https://cdn..."
            />
          </label>

          <label>
            <div className="modal-label">開始日時（任意）</div>
            <input
              className="modal-input"
              type="datetime-local"
              value={editing.startsAt}
              onChange={(e) => onChange({ ...editing, startsAt: e.target.value })}
            />
          </label>

          <label>
            <div className="modal-label">終了日時（任意）</div>
            <input
              className="modal-input"
              type="datetime-local"
              value={editing.endsAt}
              onChange={(e) => onChange({ ...editing, endsAt: e.target.value })}
            />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={editing.isEnabled}
              onChange={(e) => onChange({ ...editing, isEnabled: e.target.checked })}
            />
            <span className="modal-label">有効（ONなら期間内に表示）</span>
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn btn-primary" onClick={onSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
