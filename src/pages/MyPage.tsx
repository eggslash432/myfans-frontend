import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api';

type MeSummary = {
  profile: { id: string; email: string; role: string; displayName?: string; avatarUrl?: string };
  subscriptions: Array<{
    id: string;
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | string;
    startedAt?: string;
    renewAt?: string;
    planName?: string;
    creatorName?: string;
  }>;
  payments: Array<{
    id: string;
    amountJpy: number;
    status: 'succeeded' | 'failed' | 'pending' | string;
    title?: string;
    paidAt?: string;
    createdAt?: string;
  }>;
};

export default function MyPage() {
  const [data, setData] = useState<MeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Hooks は常にトップレベルで呼ぶ（早期 return より前）
  const activeSub = useMemo(
    () => data?.subscriptions?.find((s) => s.status === 'active') ?? null,
    [data?.subscriptions]
  );

  useEffect(() => {
    (async () => {
      try {
        const d = await apiGet('/users/me/summary');
        setData(d);
      } catch (e: any) {
        setError(e.message ?? 'load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">No session</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold">マイページ</h1>
        <p className="text-slate-600 mt-1">{data.profile?.email}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">現在の購読</h2>
        {activeSub ? (
          <div className="rounded-lg border p-4">
            <div className="font-semibold">{activeSub.planName ?? '購読中プラン'}</div>
            <div className="text-slate-600 mt-1">
              ステータス：{activeSub.status}／ 次回更新：{activeSub.renewAt ?? '-'}
            </div>
            <div className="text-slate-600">クリエイター：{activeSub.creatorName ?? '-'}</div>
          </div>
        ) : (
          <div className="rounded-lg border p-4 text-slate-600">アクティブな購読はありません</div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">支払い履歴</h2>
        <div className="rounded-lg border divide-y">
          {data.payments?.length ? (
            data.payments.slice(0, 10).map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title ?? '購入'}</div>
                  <div className="text-sm text-slate-500">
                    {p.createdAt ?? p.paidAt ?? ''} ／ {p.status}
                  </div>
                </div>
                <div className="text-lg">¥{(p.amountJpy ?? 0).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="p-4 text-slate-600">履歴がありません</div>
          )}
        </div>
      </section>
    </div>
  );
}
