import { useEffect, useState } from 'react';
import { fetchPaymentHistory } from '../api';
import type { PaymentRecord } from '../types';

export default function PaymentHistory({ userId }: { userId: string }) {
  const [items, setItems] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    (async () => {
      const d = await fetchPaymentHistory(userId);
      setItems(d ?? []);
    })();
  }, [userId]);

  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">支払い履歴</h2>
      <ul className="text-sm divide-y">
        {items.map(r => (
          <li key={r.id} className="py-1">
            {new Date(r.createdAt).toLocaleDateString()}：{r.amountJpy}円（{r.status}）
          </li>
        ))}
      </ul>
    </div>
  );
}
