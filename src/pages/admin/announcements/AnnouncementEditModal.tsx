// front/src/pages/admin/announcements/AnnouncementEditModal.tsx
import { useEffect, useMemo, useState } from "react";
import { type AnnouncementMedia, type AnnouncementEditState } from "@/shared";
import { listAnnouncementMedia, uploadAnnouncementMedia } from "@/features/announcements";
import { isImage } from "@/features/admin";


export function AnnouncementEditModal({
  editing,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  editing: AnnouncementEditState;
  saving: boolean;
  onChange: (next: AnnouncementEditState) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const announcementId = editing.id;

  const [media, setMedia] = useState<AnnouncementMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaErr, setMediaErr] = useState("");
  const [showLegacyUrlInput, setShowLegacyUrlInput] = useState(false);

  const loadMedia = async () => {
    if (!announcementId) {
      setMedia([]);
      return;
    }
    setMediaErr("");
    setLoadingMedia(true);
    try {
      const res = await listAnnouncementMedia(announcementId);
      setMedia(res.items ?? []);
    } catch (e) {
      console.error(e);
      setMediaErr("メディア一覧の取得に失敗しました。");
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    void loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId]);

  const selectedMedia = useMemo(() => {
    if (!editing.bannerMediaId) return null;
    return media.find((m) => m.id === editing.bannerMediaId) ?? null;
  }, [editing.bannerMediaId, media]);

  // プレビューURLの優先順位：選択メディア > 互換URL
  const previewUrl = selectedMedia?.url || editing.bannerImageUrl || "";

  const onUploadFiles = async (files: FileList | null) => {
    if (!announcementId) return;
    if (!files || files.length === 0) return;

    setMediaErr("");
    setUploading(true);
    try {
      const res = await uploadAnnouncementMedia(announcementId, Array.from(files));

      // ✅ 追加: アップロード結果から「最後の画像」を自動選択
      const uploadedItems = res.items ?? [];
      const lastImage = [...uploadedItems]
        .filter((m) => (m.mediaType ?? "").toLowerCase().includes("image"))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .at(-1);

      await loadMedia();

      if (lastImage) {
        onChange({
          ...editing,
          bannerMediaId: lastImage.id,
          bannerImageUrl: lastImage.url, // 互換（詳細画面がこれを見るなら必須）
        });
      }
    } catch (e) {
      console.error(e);
      setMediaErr("アップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

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

          {/* ✅ バナーはURL入力ではなくメディア選択 */}
          <div>
            <div
              className="modal-label"
              style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>バナー画像（任意）</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>※ URL入力ではなくメディアを選択</span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => void loadMedia()}
                  disabled={!announcementId || loadingMedia}
                  title={!announcementId ? "新規作成の場合は、先に保存してから利用できます" : ""}
                >
                  再読込
                </button>

                <label
                  className={`btn btn-sm btn-ghost ${!announcementId ? "opacity-50" : ""}`}
                  style={{ cursor: announcementId ? "pointer" : "not-allowed" }}
                  title={!announcementId ? "新規作成の場合は、先に保存してからアップロードできます" : ""}
                >
                  {uploading ? "アップロード中..." : "アップロード"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    disabled={!announcementId || uploading}
                    onChange={(e) => void onUploadFiles(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {!announcementId ? (
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  border: "1px solid rgba(0,0,0,.12)",
                  borderRadius: 12,
                  opacity: 0.85,
                  fontSize: 13,
                }}
              >
                新規作成の場合は、いったん「保存」してからバナー画像を追加できます。
              </div>
            ) : null}

            {mediaErr ? (
              <div style={{ marginTop: 8, color: "crimson", fontSize: 12 }}>{mediaErr}</div>
            ) : null}

            {announcementId ? (
              loadingMedia ? (
                <div style={{ padding: 8, opacity: 0.7 }}>メディア一覧を読み込み中…</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 10,
                    marginTop: 8,
                  }}
                >
                  {/* 未選択 */}
                  <button
                    className="btn btn-ghost"
                    style={{
                      border: "1px dashed rgba(0,0,0,.2)",
                      height: 84,
                      borderRadius: 12,
                    }}
                    onClick={() =>
                      onChange({
                        ...editing,
                        bannerMediaId: null,
                        bannerImageUrl: "",
                      })
                    }
                    type="button"
                  >
                    バナーなし
                  </button>

                  {media
                    .filter(isImage)
                    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                    .map((m) => {
                      const active = editing.bannerMediaId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            onChange({
                              ...editing,
                              bannerMediaId: m.id,
                              // ✅ 互換：保存先がまだURLならこれで効く
                              bannerImageUrl: m.url,
                            })
                          }
                          style={{
                            border: active ? "2px solid #ff4d7d" : "1px solid rgba(0,0,0,.12)",
                            borderRadius: 12,
                            overflow: "hidden",
                            padding: 0,
                            height: 84,
                            background: "#fff",
                          }}
                          title={`media#${m.id}`}
                        >
                          <img
                            src={m.url}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </button>
                      );
                    })}
                </div>
              )
            ) : null}

            {/* プレビュー */}
            {previewUrl ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>プレビュー</div>
                <img
                  src={previewUrl}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "contain",
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,.12)",
                    background: "#fff",
                  }}
                />
              </div>
            ) : null}

            {/* 互換：URL入力を残す（隠しておく） */}
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setShowLegacyUrlInput((v) => !v)}
              >
                {showLegacyUrlInput ? "URL入力を隠す" : "URL入力を表示（互換用）"}
              </button>

              {showLegacyUrlInput ? (
                <input
                  className="modal-input"
                  value={editing.bannerImageUrl}
                  onChange={(e) =>
                    onChange({
                      ...editing,
                      bannerImageUrl: e.target.value,
                      bannerMediaId: null, // URL優先にしたいなら mediaId を外す
                    })
                  }
                  placeholder="https://cdn..."
                  style={{ marginTop: 8 }}
                />
              ) : null}
            </div>
          </div>

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
