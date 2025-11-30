// front/src/pages/creators/CreatorPlansPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { PlansResponse } from '../../shared/types';

export default function CreatorPlansPage() {
  const [data, setData] = useState<PlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await api.getMyPlans(); // GET /plans
        setData(res);
      } catch (e: any) {
        console.error('load my plans failed', e);
        setErr(e?.message ?? 'プラン一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const plans = data?.plans ?? [];

  return (
    <div className="page space-y-4">
      <h1 className="page-title">プラン設定</h1>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-title">作成済みプラン</div>
          {/* まだAPIがないのでダミーボタン */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => alert('プラン作成機能は後で実装予定です')}
          >
            新規プラン作成
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && plans.length === 0 && (
          <p className="text-sm text-gray-500">まだプランがありません。</p>
        )}

        {!loading && !err && plans.length > 0 && (
          <ul className="space-y-2 text-sm">
            {plans.map((p) => (
              <li
                key={p.id}
                className="border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white"
              >
                <div>
                  <div className="font-medium">
                    {p.name || '無題プラン'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ¥{p.priceJpy?.toLocaleString() ?? '0'} / 月
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-pink-500 underline"
                  onClick={() => alert('編集機能は後で実装予定です')}
                >
                  編集
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
