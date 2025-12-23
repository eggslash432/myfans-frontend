import { useEffect, useState } from 'react';
import { ApiError } from '../../lib/api/apiClient';
import {
  adminApprovePayout,
  adminListPayoutRequests,
  adminDownloadPayoutCsv,
} from '@/lib/api';
import type { AdminPayout } from '../../shared/types';

function statusLabel(s: string) {
  switch (s) {
    case 'requested': return '申請中';
    case 'approved': return '承認済み';
    case 'paid': return '送金済み';
    case 'rejected': return '却下';
    default: return s;
  }
}

function targetLabel(p: AdminPayout) {
  return p.targetType === 'SHOP' ? 'SHOP' : 'CREATOR';
}

function targetName(p: AdminPayout) {
  if (p.targetType === 'SHOP') {
    return p.shop?.name ?? p.shopId ?? '-';
  }
  return p.creator?.publicName ?? p.creatorId ?? '-';
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [month, setMonth] = useState(''); // ★ CSV 月指定

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await adminListPayoutRequests();
      setPayouts(data ?? []);
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setPayouts([]);
          setErr(
            '管理者としての認証に失敗しました。いったんログアウトしてログインし直してください。',
          );
        } else if (e.status === 404) {
          setPayouts([]);
          setErr('');
        } else {
          setErr(e.body?.message ?? '出金申請一覧を取得できませんでした。');
        }
      } else {
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
    if (!confirm('この出金申請を承認しますか？')) return;
    try {
      await adminApprovePayout(id);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '承認処理に失敗しました');
    }
  };

  const handleCsvDownload = () => {
    adminDownloadPayoutCsv(month || undefined);
  };

  return (
    <div className="page space-y-4">
      {/* ===== ヘッダー ===== */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">出金申請一覧</h1>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
          />
          <button
            onClick={handleCsvDownload}
            className="btn btn-secondary"
          >
            CSVダウンロード
          </button>
        </div>
      </div>

      {/* ===== 状態表示 ===== */}
      {loading && (
        <section className="card">
          <p className="section-subtitle">読み込み中...</p>
        </section>
      )}

      {err && (
        <section className="card">
          <p className="text-sm text-red-600">{err}</p>
        </section>
      )}

      {!loading && !err && payouts.length === 0 && (
        <section className="card">
          <p className="section-subtitle">現在、出金申請はありません。</p>
        </section>
      )}

      {/* ===== 一覧 ===== */}
      {!loading && payouts.length > 0 && (
        <>
          {/* ===== PC / Tablet ===== */}
          <div className="admin-only-desktop">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>種別</th>
                    <th>対象</th>
                    <th>金額</th>
                    <th>状態</th>
                    <th>申請日時</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="admin-id" title={p.id}>{p.id}</td>
                      <td>{targetLabel(p)}</td>
                      <td className="admin-id" title={targetName(p)}>
                        {targetName(p)}
                      </td>
                      <td>¥{Number(p.amountJpy).toLocaleString()}</td>
                      <td>
                        <span className={`admin-status admin-status--${p.payoutStatus}`}>
                          {statusLabel(p.payoutStatus)}
                        </span>
                      </td>
                      <td>{new Date(p.requestedAt).toLocaleString()}</td>
                      <td>
                        {p.payoutStatus === 'requested' && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="btn btn-primary btn-sm"
                          >
                            承認
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== Mobile ===== */}
          <div className="admin-only-mobile">
            <div className="admin-cards">
              {payouts.map((p) => (
                <section key={p.id} className="admin-post-card">
                  <div className="admin-post-title">
                    ¥{Number(p.amountJpy).toLocaleString()}
                  </div>

                  <div className="admin-post-meta">
                    <span className={`admin-status admin-status--${p.payoutStatus}`}>
                      {statusLabel(p.payoutStatus)}
                    </span>
                    <span>{new Date(p.requestedAt).toLocaleString()}</span>
                  </div>

                  <div className="admin-post-idline">
                    {targetLabel(p)}: {targetName(p)}
                  </div>

                  <div className="admin-post-idline">
                    ID: {p.id}
                  </div>

                  {p.payoutStatus === 'requested' && (
                    <div className="admin-post-actions">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="btn btn-primary w-full justify-center"
                      >
                        承認
                      </button>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
