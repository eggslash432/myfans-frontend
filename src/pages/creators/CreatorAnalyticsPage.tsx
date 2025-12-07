// front/src/pages/creators/CreatorAnalyticsPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type SimpleSummary = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};

export default function CreatorAnalyticsPage() {
  const [summary, setSummary] = useState<SimpleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');

        // ✅ 専用APIに差し替え
        const res = await api.creatorAnalyticsMe();

        setSummary({
          totalRevenueJpy: res.totalRevenueJpy ?? 0,
          totalSubscribers: res.totalSubscribers ?? 0,
        });
      } catch (e: any) {
        console.error('load analytics failed', e);
        setErr(e?.message ?? '売上情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page space-y-4">
      <h1 className="page-title">売上レポート</h1>

      <section className="card space-y-3">
        <div className="section-title">サマリー</div>

        {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && summary && (
          <div className="text-sm space-y-1">
            <div>
              累計売上：
              <span className="font-semibold">
                ¥{summary.totalRevenueJpy.toLocaleString()}
              </span>
            </div>
            <div>
              累計購読者数：
              <span className="font-semibold">
                {summary.totalSubscribers.toLocaleString()} 名
              </span>
            </div>
          </div>
        )}

        {!loading && !err && !summary && (
          <p className="text-sm text-gray-500">
            売上レポート機能は準備中です。
          </p>
        )}
      </section>

      <section className="card space-y-2">
        <div className="section-title">今後の拡張予定</div>
        <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
          <li>日別・月別の売上グラフ</li>
          <li>投稿ごとの売上ランキング</li>
          <li>新規購読・解約推移</li>
        </ul>
      </section>
    </div>
  );
}
