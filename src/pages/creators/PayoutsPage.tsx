
// src/pages/creator/PayoutsPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

type Payout = {
  id: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
};

export default function PayoutsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [items, setItems] = useState<Payout[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState<string>('');

  async function loadAll() {
    try {
      setLoadingAll(true);
      setError('');
      const bal = await api.get<{ balanceJpy: number }>(
        '/creators/me/payouts/balance',
      );
      setBalance(bal.balanceJpy);

      const list = await api.get<Payout[]>('/creators/me/payouts');
      setItems(list);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? '読み込みに失敗しました');
    } finally {
      setLoadingAll(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleRequest() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert('正しい金額を入力してください');
      return;
    }
    setLoading(true);
    try {
      await api.post('/creators/me/payouts/request', { amountJpy: num });
      alert('出金リクエストを送信しました');
      setAmount('');
      await loadAll();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        '出金リクエストに失敗しました';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  function renderStatusLabel(s: PayoutStatus) {
    switch (s) {
      case 'requested':
        return '申請中';
      case 'approved':
        return '承認済（振込待ち）';
      case 'paid':
        return '振込済み';
      case 'rejected':
        return '却下';
      default:
        return s;
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">出金管理</h1>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* 残高表示 */}
      <section className="border rounded p-4 space-y-2">
        <div className="text-sm text-gray-600">出金可能残高</div>
        <div className="text-2xl font-semibold">
          {balance == null ? '読み込み中…' : `¥${balance.toLocaleString()}`}
        </div>
      </section>

      {/* 出金リクエストフォーム */}
      <section className="border rounded p-4 space-y-3">
        <div className="font-semibold">出金リクエスト</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            className="border rounded px-3 py-2 w-48"
            placeholder="金額（円）"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleRequest}
            disabled={loading}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? '送信中…' : '出金申請する'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          出金可能残高の範囲内で申請できます。
        </p>
      </section>

      {/* リスト */}
      <section className="border rounded p-4 space-y-3">
        <div className="font-semibold">出金履歴</div>
        {loadingAll ? (
          <div>読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">
            まだ出金リクエストはありません。
          </div>
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
                  <td className="py-1">
                    {new Date(p.requestedAt).toLocaleString()}
                  </td>
                  <td className="py-1 text-right">
                    ¥{p.amountJpy.toLocaleString()}
                  </td>
                  <td className="py-1">{renderStatusLabel(p.payoutStatus)}</td>
                  <td className="py-1">
                    {p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
