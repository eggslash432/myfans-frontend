// front/src/pages/posts/PostEditModal/PostEditModal.tsx
import { usePostEditForm } from "./usePostEditForm";
import { MediaEditor } from "./MediaEditor";
import { PublishSettings } from "./PublishSettings";
import { useAuth } from "../../../hooks/useAuth";
import type { PostProps } from "../../../shared/types";

export function PostEditModal({
  post,
  open,
  saving,
  onClose,
  onSubmit,
  onAddMedia,
  onRemoveMedia,
}: PostProps) {
  const { user } = useAuth();
  const isAdminAccount = user?.role === "admin" || user?.role === "sub_admin";

  const form = usePostEditForm({ post, isAdminAccount });

  if (!open || !post) return null;

  const mediaAssets = form.rawPost?.mediaAssets ?? form.rawPost?.media ?? form.rawPost?.medias ?? [];

  const handleSaveClick = () => {
    onSubmit(form.buildPayload());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div>
            <div className="modal-title">投稿を編集</div>
            <div className="modal-subtitle">ID: {form.rawPost?.id}</div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div>
            <div className="modal-label">タイトル</div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              className="modal-input"
            />
          </div>

          <div>
            <div className="modal-label">本文</div>
            <textarea
              value={form.body}
              onChange={(e) => form.setBody(e.target.value)}
              className="modal-textarea"
              rows={4}
            />
          </div>

          <MediaEditor
            mediaAssets={mediaAssets}
            saving={saving}
            onAddMedia={onAddMedia}
            onRemoveMedia={onRemoveMedia}
          />

          <PublishSettings
            isAdminAccount={isAdminAccount}
            isPublished={form.isPublished}
            visibility={form.visibility}
            setVisibility={form.setVisibility}
            priceJpy={form.priceJpy}
            setPriceJpy={form.setPriceJpy}
            status={form.status}
            setStatus={form.setStatus}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>
            キャンセル
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveClick} disabled={saving}>
            {saving ? "保存中…" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
