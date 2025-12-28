// front/src/pages/admin/components/CreatorApplicationCard.tsx

import { 
  type CreatorApplication 
} from "@/shared";
import { creatorApprovalBadgeClass, creatorApprovalStatusLabel } from "../domain";


export function CreatorApplicationCard(props: {
  item: CreatorApplication;
  busy: boolean;
  onApprove: (userId: string) => void;
  onOpenReject: (item: CreatorApplication) => void;
}) {
  const { item: c, busy, onApprove, onOpenReject } = props;

  return (
    <div className="admin-post-card" style={{ padding: 14 }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="admin-post-title truncate">
            {c.publicName || c.displayName || "（表示名未設定）"}
          </div>
          <div className="text-[11px] text-gray-500 truncate">{c.email}</div>
        </div>

        <span className={creatorApprovalBadgeClass(c.approvalStatus)}>{creatorApprovalStatusLabel(c.approvalStatus)}</span>
      </div>

      <div className="admin-post-meta">
        <span>申請日：{new Date(c.createdAt).toLocaleString()}</span>
        {typeof c.applicationCount === "number" && <span>再申請：{c.applicationCount} 回</span>}
        {c.lastAppliedAt && <span>最終申請：{new Date(c.lastAppliedAt).toLocaleString()}</span>}
      </div>

      {c.approvalStatus === "rejected" && c.rejectReason && (
        <div className="mt-2 text-[12px] text-red-600">却下理由：{c.rejectReason}</div>
      )}

      <div className="admin-post-actions">
        {c.approvalStatus === "pending" ? (
          <>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onApprove(c.userId)}
              disabled={busy}
            >
              承認
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm text-red-600"
              onClick={() => onOpenReject(c)}
              disabled={busy}
            >
              却下
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onOpenReject(c)} disabled={busy}>
            詳細
          </button>
        )}
      </div>
    </div>
  );
}
