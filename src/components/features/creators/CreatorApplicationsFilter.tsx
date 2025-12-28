// front/src/pages/admin/components/CreatorApplicationsFilter.tsx

import { 
  creatorApprovalStatusLabel, 
  type CreatorApprovalStatusFilter 
} from "@/shared";

export function CreatorApplicationsFilter(props: {
  status: CreatorApprovalStatusFilter;
  onChangeStatus: (s: CreatorApprovalStatusFilter) => void;
  q: string;
  onChangeQ: (v: string) => void;
  onSearch: () => void;
  onReload: () => void;
  busy: boolean;
}) {
  const { status, onChangeStatus, q, onChangeQ, onSearch, onReload, busy } = props;

  const chips: CreatorApprovalStatusFilter[] = ["pending", "approved", "rejected", "all"];

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">フィルタ</div>
        <button className="btn btn-outline btn-sm" onClick={onReload} disabled={busy} type="button">
          再読み込み
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn-sm ${status === s ? "btn-primary" : "btn-outline"}`}
            onClick={() => onChangeStatus(s)}
            disabled={busy}
          >
            {creatorApprovalStatusLabel(s)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="admin-input w-full"
          placeholder="検索（email / 表示名） 例: creator2 / example"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <button className="btn btn-primary" onClick={onSearch} disabled={busy} type="button">
          検索
        </button>
      </div>
    </div>
  );
}
