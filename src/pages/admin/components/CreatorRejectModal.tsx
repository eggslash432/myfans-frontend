// front/src/pages/admin/components/CreatorRejectModal.tsx
import type { CreatorApplication } from "../../../shared/types";

export default function CreatorRejectModal(props: {
  open: boolean;
  busy: boolean;
  target: CreatorApplication | null;
  reason: string;
  onChangeReason: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { open, busy, target, reason, onChangeReason, onClose, onSubmit } = props;

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (busy) return;
        onClose();
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">却下理由</div>
          <div className="modal-subtitle">ユーザーに表示されます</div>
        </div>

        <div className="text-sm font-semibold">
          対象：{target?.publicName || target?.displayName}（{target?.email}）
        </div>

        <div className="modal-body">
          <label className="modal-label">理由</label>
          <textarea
            className="modal-textarea"
            placeholder="例：本人確認書類の不鮮明、プロフィール不備 など"
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
            disabled={busy}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>
            キャンセル
          </button>
          <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={busy}>
            却下する
          </button>
        </div>
      </div>
    </div>
  );
}
