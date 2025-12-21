// front/src/pages/admin/components/UploadSettingsSection.tsx

import type { UploadSetting } from "../../../shared/types";

export function UploadSettingsSection(props: {
  uploadSettings: UploadSetting;
  setUploadSettings: React.Dispatch<React.SetStateAction<UploadSetting>>;
  onSave: () => Promise<void>;
  saving: boolean;
  message: string | null;
  setMessage: (v: string | null) => void;
}) {
  const { uploadSettings, setUploadSettings, onSave, saving, message, setMessage } = props;

  const handleSubmit = async () => {
    if (uploadSettings.maxFileSizeMb < 1 || uploadSettings.maxFileSizeMb > 1024) {
      setMessage("最大ファイルサイズは 1〜1024MB の範囲で設定してください。");
      return;
    }
    if (uploadSettings.maxFiles < 1 || uploadSettings.maxFiles > 50) {
      setMessage("最大ファイル数は 1〜50 の範囲で設定してください。");
      return;
    }
    await onSave();
  };

  return (
    <section className="settings-card" style={{ marginTop: 16 }}>
      <div className="settings-item-main">
        <div className="settings-item-title">アップロード制限</div>
        <div className="settings-item-sub">
          投稿メディアのアップロード上限（1ファイルあたり / 1投稿あたり）を設定します。
        </div>
      </div>

      <form
        className="settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="settings-form-group">
          <label className="settings-form-label">最大ファイルサイズ（MB）</label>
          <input
            type="number"
            className="settings-form-input"
            min={1}
            max={1024}
            value={uploadSettings.maxFileSizeMb}
            onChange={(e) =>
              setUploadSettings((prev) => ({
                ...prev,
                maxFileSizeMb: Number(e.target.value || 0),
              }))
            }
          />
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">最大ファイル数（件）</label>
          <input
            type="number"
            className="settings-form-input"
            min={1}
            max={50}
            value={uploadSettings.maxFiles}
            onChange={(e) =>
              setUploadSettings((prev) => ({
                ...prev,
                maxFiles: Number(e.target.value || 0),
              }))
            }
          />
        </div>

        {message && <div className="settings-message settings-message-success">{message}</div>}

        <button type="submit" className="settings-form-submit" disabled={saving}>
          {saving ? "保存中…" : "アップロード制限を保存"}
        </button>
      </form>
    </section>
  );
}
