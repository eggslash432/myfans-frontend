// front/src/pages/admin/AdminSummaryPage.tsx

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetSummary } from '../../lib/api/admin';
import type { AdminSummary } from '../../shared/types';

type FeeSetting = {
  managerPercent: number;
  shopPercent: number;
  creatorPercent: number;
  updatedAt?: string;
};

type AdminSalesBreakdown = {
  month: string; // YYYY-MM
  // 支払総額（paid）
  grossAmountJpy: number;

  // 分配（Paymentスナップショット集計）
  platformAmountJpy: number;
  shopAmountJpy: number;
  creatorAmountJpy: number;

  // 任意（あれば）
  stripeFeeJpy?: number;

  // 件数
  paidCount: number;
};

type AdminPaymentRow = {
  id: string;
  paidAt: string | null;
  amountJpy: number;

  // スナップショット
  platformAmountJpy: number | null;
  shopAmountJpy: number | null;
  creatorAmountJpy: number | null;
  stripeFeeJpy: number | null;

  // 紐づけ
  creatorId: string | null; // ※現状は creator.userId 想定
  shopId: string | null;

  externalTxId: string | null;
};

function yen(n: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(n);
}

function isoToLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * ここはプロジェクトのAPI設計に合わせて調整してOK：
 * - VITE_API_BASE_URL があればそれを使う
 * - 無ければ同一オリジン前提
 */
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

/**
 * 追加：手数料設定を取得（例）
 * - もし既に admin/settings で使ってるAPIがあるなら、ここをその関数に差し替えてOK
 */
async function adminGetFeeSetting(): Promise<FeeSetting> {
  return await fetchJson<FeeSetting>('/admin/fee-setting');
}

/**
 * 追加：月次の分配内訳（例）
 * - Payment(paymentStatus=paid & month) を集計して返すAPIを想定
 */
async function adminGetSalesBreakdown(month: string): Promise<AdminSalesBreakdown> {
  const q = new URLSearchParams({ month });
  return await fetchJson<AdminSalesBreakdown>(`/admin/sales/breakdown?${q.toString()}`);
}

/**
 * 追加：月次の支払い一覧（例）
 * - 最新N件だけ返すAPIを想定
 */
async function adminListPayments(month: string, limit = 30): Promise<AdminPaymentRow[]> {
  const q = new URLSearchParams({ month, limit: String(limit) });
  return await fetchJson<AdminPaymentRow[]>(`/admin/payments?${q.toString()}`);
}

function currentMonthStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function AdminSummaryPage() {
  const [month, setMonth] = useState<string>(currentMonthStr());

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [fee, setFee] = useState<FeeSetting | null>(null);
  const [breakdown, setBreakdown] = useState<AdminSalesBreakdown | null>(null);
  const [payments, setPayments] = useState<AdminPaymentRow[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>('');
  const [warnFee, setWarnFee] = useState<string>('');
  const [warnBreakdown, setWarnBreakdown] = useState<string>('');
  const [warnPayments, setWarnPayments] = useState<string>('');

  const canShowBreakdown = useMemo(() => !!breakdown, [breakdown]);
  const canShowPayments = useMemo(() => !!payments && payments.length > 0, [payments]);

  const load = async () => {
    try {
      setLoading(true);
      setErr('');

      setWarnFee('');
      setWarnBreakdown('');
      setWarnPayments('');

      // 1) 既存：サマリ（今月）
      const s = await adminGetSummary();
      setSummary(s);

      // 2) 追加：手数料設定（無ければ未実装表示）
      try {
        const fs = await adminGetFeeSetting();
        setFee(fs);
      } catch (e) {
        console.warn(e);
        setFee(null);
        setWarnFee('手数料設定の取得APIが未実装、または権限/パスが不一致です。');
      }

      // 3) 追加：月次の内訳（無ければ未実装表示）
      try {
        const b = await adminGetSalesBreakdown(month);
        setBreakdown(b);
      } catch (e) {
        console.warn(e);
        setBreakdown(null);
        setWarnBreakdown('売上内訳（分配集計）のAPIが未実装、または権限/パスが不一致です。');
      }

      // 4) 追加：支払い一覧（無ければ未実装表示）
      try {
        const list = await adminListPayments(month, 30);
        setPayments(list);
      } catch (e) {
        console.warn(e);
        setPayments(null);
        setWarnPayments('支払い一覧のAPIが未実装、または権限/パスが不一致です。');
      }
    } catch (e) {
      console.error(e);
      setErr('サマリ情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const s = summary ?? { salesMonthly: 0, newUsersMonthly: 0, reportsPending: 0 };

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: 0, textAlign: 'left' }}>
              管理サマリ
            </h1>
            <div className="page-description" style={{ marginBottom: 0 }}>
              月次の売上・分配（手数料）・支払い・出金の整合チェック用
            </div>
          </div>

          <button type="button" onClick={load} className="btn btn-outline btn-sm">
            ⟳ 再読み込み
          </button>
        </div>

        {/* 月選択 */}
        <div className="card" style={{ padding: '12px 14px' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="section-title" style={{ marginBottom: 4 }}>
                対象月
              </div>
              <div className="section-subtitle">内訳・一覧はこの月で絞り込みます</div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="input"
                style={{ height: 34 }}
              />
              <Link to="/admin/payouts">
                <button className="btn btn-primary btn-sm">出金管理</button>
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            読み込み中…
          </div>
        )}

        {err && <div className="auth-error">{err}</div>}

        {!loading && !err && (
          <div className="space-y-3">
            {/* 今月の売上（既存 summary） */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="section-title" style={{ marginBottom: 6 }}>
                    月間売上（既存サマリ）
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
                    {yen(s.salesMonthly)}
                  </div>
                  <div className="section-subtitle">
                    API <code>/admin/summary</code> の salesMonthly（今月1日〜）
                  </div>
                </div>

                {/* ここが “押したらサマリへ” の想定導線 */}
                <div className="text-right">
                  <div className="section-subtitle" style={{ marginBottom: 8 }}>
                    ※内訳・支払い一覧は下へ
                  </div>
                  <Link to="/admin/settings">
                    <button className="btn btn-outline btn-sm">手数料設定へ</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 手数料設定 */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div className="section-title">手数料（分配率）</div>
                <Link to="/admin/settings">
                  <button className="btn btn-outline btn-sm">設定を開く</button>
                </Link>
              </div>

              {warnFee && <div className="text-xs text-amber-700 mb-2">{warnFee}</div>}

              {fee ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="card" style={{ padding: 10 }}>
                    <div className="section-subtitle">運営</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{fee.managerPercent}%</div>
                  </div>
                  <div className="card" style={{ padding: 10 }}>
                    <div className="section-subtitle">Shop</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{fee.shopPercent}%</div>
                  </div>
                  <div className="card" style={{ padding: 10 }}>
                    <div className="section-subtitle">Creator</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{fee.creatorPercent}%</div>
                  </div>
                </div>
              ) : (
                <div className="section-subtitle">
                  取得できていません（API未実装の可能性）
                </div>
              )}
            </div>

            {/* 分配内訳（Paymentスナップショット集計） */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>
                売上内訳（分配スナップショット集計）
              </div>

              {warnBreakdown && (
                <div className="text-xs text-amber-700 mb-2">{warnBreakdown}</div>
              )}

              {canShowBreakdown ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">支払総額（paid）</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {yen(breakdown!.grossAmountJpy)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        件数：{breakdown!.paidCount.toLocaleString()}
                      </div>
                    </div>

                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">Stripe手数料（任意）</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {yen(breakdown!.stripeFeeJpy ?? 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ※取得できない場合は0表示
                      </div>
                    </div>

                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">運営取り分</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {yen(breakdown!.platformAmountJpy)}
                      </div>
                    </div>

                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">Shop取り分</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {yen(breakdown!.shopAmountJpy)}
                      </div>
                    </div>

                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">Creator取り分</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        {yen(breakdown!.creatorAmountJpy)}
                      </div>
                    </div>

                    <div className="card" style={{ padding: 10 }}>
                      <div className="section-subtitle">合計チェック</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>
                        {yen(
                          (breakdown!.platformAmountJpy ?? 0) +
                            (breakdown!.shopAmountJpy ?? 0) +
                            (breakdown!.creatorAmountJpy ?? 0),
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ※ gross と一致するのが理想（StripeFeeの扱い次第）
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="section-subtitle">
                  まだ表示できません（API未実装 or 集計対象がありません）
                </div>
              )}
            </div>

            {/* 支払い一覧（最新N件） */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>
                支払い一覧（最新）
              </div>

              {warnPayments && (
                <div className="text-xs text-amber-700 mb-2">{warnPayments}</div>
              )}

              {canShowPayments ? (
                <div className="overflow-x-auto">
                  <table className="table" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>日時</th>
                        <th>総額</th>
                        <th>運営</th>
                        <th>Shop</th>
                        <th>Creator</th>
                        <th>tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments!.map((p) => (
                        <tr key={p.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {p.paidAt ? isoToLocal(p.paidAt) : '-'}
                          </td>
                          <td>{yen(p.amountJpy)}</td>
                          <td>{yen(p.platformAmountJpy ?? 0)}</td>
                          <td>{yen(p.shopAmountJpy ?? 0)}</td>
                          <td>{yen(p.creatorAmountJpy ?? 0)}</td>
                          <td style={{ maxWidth: 180 }}>
                            <div className="text-xs text-gray-600 break-all">
                              {p.externalTxId ?? '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="text-xs text-gray-500 mt-2">
                    ※ ここは「売上画面とDBの整合チェック」用。分配スナップショット（Paymentの
                    platform/shop/creatorAmountJpy）が入っていることが前提。
                  </div>
                </div>
              ) : (
                <div className="section-subtitle">
                  表示できません（API未実装 or 支払いがまだありません）
                </div>
              )}
            </div>

            {/* 既存：新規ユーザー / 通報（そのまま） */}
            <div className="grid grid-cols-2 gap-2">
              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="section-title" style={{ marginBottom: 6 }}>
                  今月の新規ユーザー
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                  {s.newUsersMonthly.toLocaleString()} 名
                </div>
                <div className="section-subtitle">今月1日以降に登録されたユーザー数</div>
              </div>

              <div className="card" style={{ padding: '14px 16px' }}>
                <div className="section-title" style={{ marginBottom: 6 }}>
                  通報（未対応）
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    marginBottom: 4,
                    color: s.reportsPending > 0 ? '#ef4444' : '#16a34a',
                  }}
                >
                  {s.reportsPending.toLocaleString()} 件
                </div>
                <div className="section-subtitle" style={{ marginBottom: 10 }}>
                  status=pending の通報数
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link to="/admin/reports">
                    <button className="btn btn-primary btn-sm">通報一覧を開く</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* 便利リンク */}
            <div className="card" style={{ padding: '12px 14px' }}>
              <div className="section-title" style={{ marginBottom: 8 }}>
                関連ページ
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/admin/payouts">
                  <button className="btn btn-outline btn-sm">出金管理</button>
                </Link>
                <Link to="/admin/settings">
                  <button className="btn btn-outline btn-sm">手数料設定</button>
                </Link>
                <Link to="/admin/creators">
                  <button className="btn btn-outline btn-sm">クリエイター</button>
                </Link>
                <Link to="/admin/posts">
                  <button className="btn btn-outline btn-sm">投稿</button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                ※ 「売上・手数料表示の最終調整」は、このページで
                FeeSetting と Paymentスナップショット集計が揃えば完了。
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
