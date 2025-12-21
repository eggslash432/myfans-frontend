// front/src/pages/creators/CreatorPlansPage/CreatorPlanModal.tsx
import type { PlanModalMode } from "@/shared/prisma-enums";

export function CreatorPlanModal(props: {
  open: boolean;
  mode: PlanModalMode;
  planName: string;
  planPrice: string;
  saving: boolean;
  error: string;
  isCreatorApproved: boolean;

  onClose: () => void;
  onChangeName: (v: string) => void;
  onChangePrice: (v: string) => void;
  onSave: () => void;
}) {
  const {
    open,
    mode,
    planName,
    planPrice,
    saving,
    error,
    isCreatorApproved,
    onClose,
    onChangeName,
    onChangePrice,
    onSave,
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={() => !saving && onClose()} />
      <div className="relative mx-auto my-24 w-full max-w-md rounded-xl bg-white shadow-lg p-5 space-y-4">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "新しいプランを作成" : "プランを編集"}
        </h2>

        <div className="space-y-3">
          <div className="form-field">
            <label className="form-label">プラン名</label>
            <input
              className="form-input"
              value={planName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="例：スタンダード"
            />
          </div>

          <div className="form-field">
            <label className="form-label">月額料金（円）</label>
            <input
              type="number"
              className="form-input"
              value={planPrice}
              onChange={(e) => onChangePrice(e.target.value)}
              placeholder="例：800"
              min={100}
              step={100}
            />
          </div>

          {error && <p className="text-xs text-red-600 whitespace-pre-wrap">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => !saving && onClose()}
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onSave}
              disabled={saving || !isCreatorApproved}
              title={!isCreatorApproved ? "承認済みクリエイターのみ利用できます" : undefined}
            >
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
