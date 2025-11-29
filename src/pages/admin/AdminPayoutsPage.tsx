// front/src/pages/admin/AdminPayoutsPage.tsx
import { useEffect, useState } from 'react';
import { api, adminApprovePayout, ApiError } from '../../lib/api';

type AdminPayout = {
  id: string;
  creatorId: string;
  amountJpy: number;
  payoutStatus: string;
  requestedAt: string;
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const res = await api.get<AdminPayout[]>('/admin/payouts');
      setPayouts(res.data ?? []);
    } catch (e: any) {
      if (e instanceof ApiError) {
        // ★ 401: ログイン切れ or 権限不足
        if (e.status === 401) {
          console.warn('/admin/payouts で 401 Unauthorized', e);
          setPayouts([]);
          setErr('管理者としての認証に失敗しました。いったんログアウトしてログインし直してください。');
        }
        // 404: API 未実装 → 空リスト扱い
        else if (e.status === 404) {
          console.warn('/admin/payouts が 404 のため空リスト扱い', e);
          setPayouts([]);
          setErr('');
        } else {
          console.error(e);
          setErr(e.body?.message ?? '出金申請一覧を取得できませんでした。');
        }
      } else {
        console.error(e);
        setErr('出金申請一覧を取得できませんでした。');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('この出金申請を承認し、Stripe送金しますか？')) return;
    try {
      const res: any = await adminApprovePayout(id);
      if (res?.transferId) {
        alert(`送金完了: Transfer ID = ${res.transferId}`);
      } else {
        alert('送金処理を実行しました。');
      }
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '送金処理に失敗しました');
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">出金申請一覧</h1>

      {loading && <div className="text-sm text-gray-500">読み込み中...</div>}

      {err && (
        <div className="text-sm text-red-600">
          {err}
        </div>
      )}

      {!loading && !err && payouts.length === 0 && (
        <div className="text-sm text-gray-600">
          現在、出金申請はありません。
        </div>
      )}

      {!loading && payouts.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Creator</th>
              <th className="py-2 text-left">Amount (JPY)</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">RequestedAt</th>
              <th className="py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2">{p.id}</td>
                <td className="py-2">{p.creatorId}</td>
                <td className="py-2">{p.amountJpy}</td>
                <td className="py-2">{p.payoutStatus}</td>
                <td className="py-2">
                  {new Date(p.requestedAt).toLocaleString()}
                </td>
                <td className="py-2">
                  {p.payoutStatus === 'requested' && (
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      承認して送金
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
