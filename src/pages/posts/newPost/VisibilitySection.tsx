// front/src/pages/posts/newPost/VisibilitySection.tsx

import type { Visibility } from '../../../shared/prisma-enums';
import type { Plan } from '../../../shared/types';

type Props = {
  isAdmin: boolean;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;

  plans: Plan[];
  selectedPlanId: string;
  setSelectedPlanId: (v: string) => void;

  ppvPrice: string;
  setPpvPrice: (v: string) => void;

  onOpenPlanModal: () => void;
};

export function VisibilitySection({
  isAdmin,
  visibility,
  setVisibility,
  plans,
  selectedPlanId,
  setSelectedPlanId,
  ppvPrice,
  setPpvPrice,
  onOpenPlanModal,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-sm">公開範囲</div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="visibility"
            checked={visibility === 'free'}
            onChange={() => setVisibility('free')}
          />
          <span>無料</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="visibility"
            checked={visibility === 'plan'}
            onChange={() => setVisibility('plan')}
            disabled={isAdmin}
          />
          <span>有料（購読者限定）</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="visibility"
            checked={visibility === 'paid_single'}
            onChange={() => setVisibility('paid_single')}
            disabled={isAdmin}
          />
          <span>PPV</span>
        </label>
      </div>

      {isAdmin && (
        <p className="mt-1 text-xs text-gray-500">
          管理者アカウントでは無料投稿のみ作成できます（有料販売・購読は不可）。
        </p>
      )}

      {/* プラン選択 */}
      {visibility === 'plan' && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            className="form-input w-full sm:w-auto sm:min-w-[240px]"
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
          >
            <option value="">プランを選択</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.priceJpy ? `（¥${p.priceJpy} /月）` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onOpenPlanModal}
          >
            ＋ 新しいプランを作成
          </button>

          {plans.length === 0 && (
            <div className="text-xs text-gray-500">
              まだプランがありません。先にプランを作成してください。
            </div>
          )}
        </div>
      )}

      {/* PPV 価格 */}
      {visibility === 'paid_single' && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <label className="form-label mb-0">PPV 価格（円）</label>
          <input
            type="number"
            min={100}
            step={100}
            value={ppvPrice}
            onChange={(e) => setPpvPrice(e.target.value)}
            className="form-input w-32"
          />
        </div>
      )}
    </div>
  );
}
