// front/src/components/features/settings/FeeSettingsSection.tsx

import type { FeeSettings } from "@/shared";

export function FeeSettingsSection(props: {
  feeSettings: FeeSettings;
  setFeeSettings: React.Dispatch<React.SetStateAction<FeeSettings>>;
  onSave: () => Promise<void>;
  saving: boolean;
  message: string | null;
  setMessage: (v: string | null) => void;
}) {
  const { feeSettings, setFeeSettings, onSave, saving, message, setMessage } = props;

  const totalPercent =
    feeSettings.managerPercent + feeSettings.shopPercent + feeSettings.creatorPercent;

  const isValid = totalPercent === 100;

  const handleChange = (key: keyof FeeSettings, value: string) => {
    const n = Number(value);
    setFeeSettings((prev) => ({
      ...prev,
      [key]: Number.isFinite(n) ? n : 0,
    }));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setMessage("合計が 100% になるように設定してください。");
      return;
    }
    await onSave();
  };

  return (
    <section className="settings-card">
      <div className="settings-item-main">
        <div className="settings-item-title">手数料設定</div>
        <div className="settings-item-sub">
          売上の分配率を設定します。合計が 100% になるようにしてください。
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
          <label className="settings-form-label">
            管理者（プラットフォーム）の取り分（%）
          </label>
          <input
            type="number"
            className="settings-form-input"
            value={feeSettings.managerPercent}
            min={0}
            max={100}
            onChange={(e) => handleChange("managerPercent", e.target.value)}
          />
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">
            店舗（仲介業者など）の取り分（%）
          </label>
          <input
            type="number"
            className="settings-form-input"
            value={feeSettings.shopPercent}
            min={0}
            max={100}
            onChange={(e) => handleChange("shopPercent", e.target.value)}
          />
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">クリエイターの取り分（%）</label>
          <input
            type="number"
            className="settings-form-input"
            value={feeSettings.creatorPercent}
            min={0}
            max={100}
            onChange={(e) => handleChange("creatorPercent", e.target.value)}
          />
        </div>

        <div className="text-xs mt-1">
          合計：{totalPercent}%
          {!isValid && (
            <span className="text-red-600 ml-1">（100% になるように調整してください）</span>
          )}
        </div>

        {message && <div className="settings-message settings-message-success">{message}</div>}

        <button type="submit" className="settings-form-submit" disabled={saving || !isValid}>
          {saving ? "保存中…" : "手数料設定を保存"}
        </button>
      </form>
    </section>
  );
}
