// front/src/pages/creator/CreatorPayoutsPage/PayoutHistoryTable.tsx
import type { Payout } from "../../../shared/types";
import type { PayoutStatus } from "../../../shared/prisma-enums";
import { renderPayoutStatusLabel } from "./payouts.types";

export function PayoutHistoryTable(props: {
  items: Payout[];
  loading: boolean;
}) {
  const { items, loading } = props;

  return (
    <section className="card space-y-3">
      <div className="section-title">出金履歴</div>

      {loading ? (
        <div className="text-sm text-gray-500">読み込み中…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">まだ出金リクエストはありません。</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">申請日</th>
              <th className="text-right py-1">金額</th>
              <th className="text-left py-1">ステータス</th>
              <th className="text-left py-1">振込日</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-1">{new Date(p.requestedAt).toLocaleString()}</td>
                <td className="py-1 text-right">¥{p.amountJpy.toLocaleString()}</td>
                <td className="py-1">{renderPayoutStatusLabel(p.payoutStatus as PayoutStatus)}</td>
                <td className="py-1">
                  {p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
