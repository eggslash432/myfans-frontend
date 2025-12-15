// front/src/pages/admin/AdminPayoutsPage.tsx
import { useEffect, useState } from 'react';
import { ApiError } from '../../lib/api/apiClient';
import { adminApprovePayout, adminListPayoutRequests } from '../../lib/api/admin';
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

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

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
          setErr('管理者としての認証に失敗しました。いったんログアウトしてログインし直してください。');
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

  useEffect(() => { void load(); }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('この出金申請を承認し、Stripe送金しますか？')) return;
    try {
      const res: any = await adminApprovePayout(id);
      alert(res?.transferId ? `送金完了: Transfer ID = ${res.transferId}` : '送金処理を実行しました。');
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '送金処理に失敗しました');
    }
  };

  return (
    <div className="page space-y-4">
      <h1 className="page-title">出金申請一覧</h1>

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

      {!loading && payouts.length > 0 && (
        <>
          {/* ✅ PC/タブレット：テーブル（横スクロール可能） */}
          <div className="admin-only-desktop">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Creator</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="admin-id" title={p.id}>{p.id}</td>
                      <td className="admin-id" title={p.creatorId}>{p.creatorId}</td>
                      <td>¥{Number(p.amountJpy ?? 0).toLocaleString()}</td>
                      <td>
                        <span className={`admin-status admin-status--${p.payoutStatus}`}>
                          {statusLabel(p.payoutStatus)}
                        </span>
                      </td>
                      <td>{new Date(p.requestedAt).toLocaleString()}</td>
                      <td>
                        <div className="admin-actions">
                          {p.payoutStatus === 'requested' && (
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="btn btn-primary btn-sm"
                            >
                              承認して送金
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ スマホ：カード */}
          <div className="admin-only-mobile">
            <div className="admin-cards">
              {payouts.map((p) => (
                <section key={p.id} className="admin-post-card">
                  <div className="admin-post-title">
                    ¥{Number(p.amountJpy ?? 0).toLocaleString()}
                  </div>

                  <div className="admin-post-meta">
                    <span className={`admin-status admin-status--${p.payoutStatus}`}>
                      {statusLabel(p.payoutStatus)}
                    </span>
                    <span>Requested: {new Date(p.requestedAt).toLocaleString()}</span>
                  </div>

                  <div className="admin-post-idline" title={p.creatorId}>
                    Creator: {p.creatorId}
                  </div>
                  <div className="admin-post-idline" title={p.id}>
                    ID: {p.id}
                  </div>

                  {p.payoutStatus === 'requested' && (
                    <div className="admin-post-actions">
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="btn btn-primary w-full justify-center"
                      >
                        承認して送金
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
