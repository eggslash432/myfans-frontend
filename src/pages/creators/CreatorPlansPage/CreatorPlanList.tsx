// front/src/pages/creators/CreatorPlansPage/CreatorPlanList.tsx
import type { Plan } from "@/shared/types";

export function CreatorPlanList(props: {
  plans: Plan[];
  isCreatorApproved: boolean;
  onMove: (index: number, delta: number) => void;
  onEdit: (plan: Plan) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  const { plans, isCreatorApproved, onMove, onEdit, onDeactivate, onReactivate } = props;

  return (
    <ul className="space-y-2 text-sm">
      {plans.map((p, idx) => (
        <li
          key={p.id}
          className="border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white"
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {p.name || "無題プラン"}
              {!p.isActive && (
                <span className="ml-2 text-xs text-gray-400">（停止中）</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              ¥{p.priceJpy?.toLocaleString() ?? "0"} / 月
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => onMove(idx, -1)}
              disabled={idx === 0}
              title="上へ"
            >
              ↑
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => onMove(idx, 1)}
              disabled={idx === plans.length - 1}
              title="下へ"
            >
              ↓
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-xs text-pink-500"
              onClick={() => onEdit(p)}
              disabled={!isCreatorApproved}
            >
              編集
            </button>

            {p.isActive ? (
              <button
                className="btn btn-outline btn-xs text-gray-600"
                onClick={() => onDeactivate(p.id)}
                disabled={!isCreatorApproved}
              >
                停止
              </button>
            ) : (
              <button
                className="btn btn-primary btn-xs"
                onClick={() => onReactivate(p.id)}
                disabled={!isCreatorApproved}
              >
                再開
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
