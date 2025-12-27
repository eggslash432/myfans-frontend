// front/src/pages/posts/PostEditModal/MediaEditor.tsx
import { useRef, type ChangeEvent } from "react";

export function MediaEditor(props: {
  mediaAssets: any[];
  saving: boolean;
  onAddMedia: (files: FileList) => void;
  onRemoveMedia: (mediaId: string) => void;
}) {
  const { mediaAssets, saving, onAddMedia, onRemoveMedia } = props;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    onAddMedia(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">添付メディア</div>

      {mediaAssets.length === 0 ? (
        <div className="text-xs text-gray-500">まだメディアは添付されていません。</div>
      ) : (
        <div className="modal-media-list">
          {mediaAssets.map((m: any) => {
            const mediaType = String(m.type ?? m.mediaType ?? "").toLowerCase();
            const key = m.id ?? m.url;
            const canRemove = !!m.id;

            return (
              <div key={key} className="modal-media-item">
                {mediaType === "image" && <img src={m.url} className="modal-media-thumb" />}
                {mediaType === "video" && <video src={m.url} controls className="modal-media-video" />}
                {mediaType === "audio" && <audio src={m.url} controls className="modal-media-audio" />}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm modal-media-remove"
                  onClick={() => {
                    if (!m.id) return;
                    onRemoveMedia(String(m.id));
                  }}
                  disabled={saving || !canRemove}
                  title={!canRemove ? "このメディアはIDが無いため削除できません（データ整合性要確認）" : undefined}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={saving}
      >
        ＋ メディアを追加
      </button>
    </div>
  );
}
