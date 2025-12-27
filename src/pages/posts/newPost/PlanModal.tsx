// front/src/pages/posts/newPost/PlanModal.tsx

type Props = {
  open: boolean;
  newPlanName: string;
  newPlanPrice: string;
  setNewPlanName: (v: string) => void;
  setNewPlanPrice: (v: string) => void;
  onClose: () => void;
  onCreate: () => Promise<void> | void;
};

export function PlanModal({
  open,
  newPlanName,
  newPlanPrice,
  setNewPlanName,
  setNewPlanPrice,
  onClose,
  onCreate,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative mx-auto my-24 w-full max-w-md rounded-xl bg-white shadow-lg p-5">
        <h3 className="text-lg font-semibold mb-4">新しいプランを作成</h3>

        <div className="space-y-3">
          <label className="form-field">
            <span className="form-label">プラン名</span>
            <input
              className="form-input"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="例：スタンダード"
            />
          </label>

          <label className="form-field">
            <span className="form-label">月額料金（円）</span>
            <input
              type="number"
              className="form-input"
              value={newPlanPrice}
              onChange={(e) => setNewPlanPrice(e.target.value)}
              placeholder="例：800"
              min={100}
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              キャンセル
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onCreate}
              disabled={!newPlanName || !newPlanPrice}
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
