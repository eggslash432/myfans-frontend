// src/pages/admin/AdminPayoutsPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

type Payout = {
  id: string;
  creatorId: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
  creator?: {
    publicName: string;
    stripeAccountId: string | null;
  };
};

export default function AdminPayoutsPage() {
  const [items, setItems] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const list = await api.get<Payout[]>('/admin/payouts?status=requested');
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    if (!confirm('この出金を承認しますか？')) return;
    setBusyId(id);
    try {
      await api.post(`/admin/payouts/${id}/approve`, {});
      alert('承認しました');
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? '承認に失敗しました');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = prompt('却下理由（任意）');
    if (reason === null) return;
    setBusyId(id);
    try {
      await api.post(`/admin/payouts/${id}/reject`, { note: reason });
      alert('却下しました');
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? '却下に失敗しました');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">出金申請（管理者）</h1>

      {loading ? (
        <div>読み込み中…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">承認待ちの出金リクエストはありません。</div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">クリエイター</th>
              <th className="text-right py-2">金額</th>
              <th className="text-left py-2">申請日</th>
              <th className="text-left py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">
                  {p.creator?.publicName ?? p.creatorId}
                </td>
                <td className="py-2 text-right">
                  ¥{p.amountJpy.toLocaleString()}
                </td>
                <td className="py-2">
                  {new Date(p.requestedAt).toLocaleString()}
                </td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => approve(p.id)}
                    disabled={busyId === p.id}
                    className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-60"
                  >
                    {busyId === p.id ? '処理中' : '承認'}
                  </button>
                  <button
                    onClick={() => reject(p.id)}
                    disabled={busyId === p.id}
                    className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-60"
                  >
                    却下
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
