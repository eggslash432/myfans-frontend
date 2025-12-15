// front/src/pages/mypage/components/PaymentHistory.tsx

import { useEffect, useState } from 'react';
import { getMyPaymentHistory } from '../../../lib/api/payments';
import type { PaymentRecord } from '../../../shared/types';

export default function PaymentHistory() {
  const [items, setItems] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getMyPaymentHistory();
        if (alive) setItems(data ?? []);
      } catch (e: any) {
        setErr(e?.message ?? '支払い履歴の取得に失敗しました');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <div className="text-sm text-gray-500">読み込み中…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">支払い履歴</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">支払い履歴はありません。</p>
      ) : (
        <ul className="text-sm divide-y">
          {items.map(r => (
            <li key={r.id} className="py-1">
              {new Date(r.createdAt).toLocaleDateString()}：
              {r.amountJpy.toLocaleString()}円（{r.status}）
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
