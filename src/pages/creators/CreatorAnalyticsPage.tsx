// front/src/pages/creators/CreatorAnalyticsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  creatorAnalyticsMe,
  creatorAnalyticsRevenueTrend,
  creatorAnalyticsPostRanking,
  creatorAnalyticsSubscriberTrend,
} from "@/lib/api/creators";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type SimpleSummary = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};

type RevenueTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  revenueJpy: number;
};

type PostRevenueRow = {
  postId: string;
  title: string;
  revenueJpy: number;
  buyers: number;
};

type SubscriberTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  newSubs: number;
  canceledSubs: number;
  net: number;
};

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CreatorAnalyticsPage() {
  // フィルタ
  const [granularity, setGranularity] = useState<"day" | "month">("day");
  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toYmd(d);
  });
  const [to, setTo] = useState<string>(() => toYmd(new Date()));

  // データ
  const [summary, setSummary] = useState<SimpleSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [postRanking, setPostRanking] = useState<PostRevenueRow[]>([]);
  const [subscriberTrend, setSubscriberTrend] = useState<SubscriberTrendPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const rangeLabel = useMemo(() => `${from} 〜 ${to}`, [from, to]);

  async function loadAll() {
    try {
      setLoading(true);
      setErr("");

      const [sumRes, revRes, rankRes, subRes] = await Promise.all([
        creatorAnalyticsMe(),
        creatorAnalyticsRevenueTrend({ granularity, from, to }),
        creatorAnalyticsPostRanking({ from, to, limit: 20 }),
        creatorAnalyticsSubscriberTrend({ granularity, from, to }),
      ]);

      setSummary({
        totalRevenueJpy: sumRes.totalRevenueJpy ?? 0,
        totalSubscribers: sumRes.totalSubscribers ?? 0,
      });

      setRevenueTrend((revRes.points ?? []).map((p: any) => ({
        date: p.date,
        revenueJpy: Number(p.revenueJpy ?? 0),
      })));

      setPostRanking((rankRes.items ?? []).map((r: any) => ({
        postId: String(r.postId),
        title: String(r.title ?? "（無題）"),
        revenueJpy: Number(r.revenueJpy ?? 0),
        buyers: Number(r.buyers ?? 0),
      })));

      setSubscriberTrend((subRes.points ?? []).map((p: any) => ({
        date: p.date,
        newSubs: Number(p.newSubs ?? 0),
        canceledSubs: Number(p.canceledSubs ?? 0),
        net: Number(p.net ?? 0),
      })));
    } catch (e: any) {
      console.error("load analytics failed", e);
      setErr(e?.response?.data?.message ?? e?.message ?? "売上情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canLoad = !!from && !!to && from <= to;

  return (
    <div className="page space-y-4">
      <h1 className="page-title">売上レポート</h1>

      {/* フィルタ */}
      <section className="card space-y-3">
        <div className="section-title">期間・表示粒度</div>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="form-field">
            <label className="form-label">粒度</label>
            <select
              className="form-input"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as any)}
            >
              <option value="day">日別</option>
              <option value="month">月別</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">開始</label>
            <input
              type="date"
              className="form-input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">終了</label>
            <input
              type="date"
              className="form-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary btn-sm"
            disabled={loading || !canLoad}
            onClick={loadAll}
            title={!canLoad ? "開始日と終了日を確認してください" : undefined}
          >
            {loading ? "更新中…" : "更新"}
          </button>

          <div className="text-xs text-gray-500 ml-auto">{rangeLabel}</div>
        </div>

        {err && <p className="text-sm text-red-600 whitespace-pre-wrap">{err}</p>}
      </section>

      {/* サマリー */}
      <section className="card space-y-3">
        <div className="section-title">サマリー</div>

        {loading && <p className="text-sm text-gray-500">読み込み中...</p>}

        {!loading && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500">累計売上</div>
              <div className="text-lg font-semibold">
                ¥{summary.totalRevenueJpy.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="text-xs text-gray-500">累計購読者数</div>
              <div className="text-lg font-semibold">
                {summary.totalSubscribers.toLocaleString()} 名
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 日別・月別 売上 */}
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-title">売上推移（{granularity === "day" ? "日別" : "月別"}）</div>
          <div className="text-xs text-gray-500">合計: ¥{revenueTrend.reduce((a, b) => a + b.revenueJpy, 0).toLocaleString()}</div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : revenueTrend.length === 0 ? (
          <p className="text-sm text-gray-500">データがありません。</p>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v: any) => [`¥${Number(v).toLocaleString()}`, "売上"]} />
                <Line type="monotone" dataKey="revenueJpy" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* 投稿ごとの売上ランキング */}
      <section className="card space-y-3">
        <div className="section-title">投稿ごとの売上ランキング</div>

        {loading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : postRanking.length === 0 ? (
          <p className="text-sm text-gray-500">データがありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">順位</th>
                  <th className="text-left py-2">投稿</th>
                  <th className="text-right py-2">売上</th>
                  <th className="text-right py-2">購入者</th>
                </tr>
              </thead>
              <tbody>
                {postRanking.map((r, i) => (
                  <tr key={r.postId} className="border-b">
                    <td className="py-2">{i + 1}</td>
                    <td className="py-2">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-gray-500">postId: {r.postId}</div>
                    </td>
                    <td className="py-2 text-right">¥{r.revenueJpy.toLocaleString()}</td>
                    <td className="py-2 text-right">{r.buyers.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 新規購読・解約推移 */}
      <section className="card space-y-3">
        <div className="section-title">新規購読・解約推移（{granularity === "day" ? "日別" : "月別"}）</div>

        {loading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : subscriberTrend.length === 0 ? (
          <p className="text-sm text-gray-500">データがありません。</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={subscriberTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="newSubs" />
                <Bar dataKey="canceledSubs" />
                <Bar dataKey="net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
