// front/src/pages/admin/AdminReportsPage.tsx
import { useEffect, useState } from 'react';
import { ApiError } from '../../lib/api/apiClient';
import { adminListReports, adminResolveReport } from '../../lib/api/admin';
import type { ReportItem } from '../../shared/types';

type ResolveAction = 'reviewed' | 'dismissed';

function getStatusMeta(status?: string | null) {
  if (status === 'reviewed') {
    return {
      text: '対応済み',
      style: {
        background: '#E6FFFA',
        borderColor: '#99F6E4',
        color: '#0F766E',
      } as React.CSSProperties,
    };
  }
  if (status === 'dismissed') {
    return {
      text: '却下',
      style: {
        background: '#F3F4F6',
        borderColor: '#E5E7EB',
        color: '#374151',
      } as React.CSSProperties,
    };
  }
  return {
    text: '未対応',
    style: {
      background: '#FFF7ED',
      borderColor: '#FED7AA',
      color: '#9A3412',
    } as React.CSSProperties,
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await adminListReports();
      setReports(data);
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 404) {
          console.warn('/admin/reports が 404 のため空リスト扱いにします', e);
          setReports([]);
          setErr('');
        } else {
          console.error(e);
          setErr(e.body?.message ?? '通報一覧の取得に失敗しました。');
        }
      } else {
        console.error(e);
        setErr('通報一覧の取得に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleResolve = async (id: string, action: ResolveAction) => {
    const msg =
      action === 'reviewed'
        ? 'この通報を「対応済み」にしますか？'
        : 'この通報を「却下」にしますか？';

    if (!confirm(msg)) return;

    try {
      setResolvingId(id);
      await adminResolveReport(id, action);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '通報の更新に失敗しました。');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* タイトル行 */}
        <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
          <h1 className="page-title" style={{ marginBottom: 0, textAlign: 'left' }}>
            通報一覧
          </h1>

          <button type="button" onClick={load} className="btn btn-outline btn-sm">
            ⟳ 再読み込み
          </button>
        </div>

        {loading && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            読み込み中…
          </div>
        )}

        {err && <div className="auth-error">{err}</div>}

        {!loading && !err && reports.length === 0 && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            現在、通報はありません。
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((r) => {
              const meta = getStatusMeta((r as any).status);
              const done = (r as any).status === 'reviewed' || (r as any).status === 'dismissed';
              const busy = resolvingId === r.id;

              return (
                <div key={r.id} className="card" style={{ padding: '12px 14px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>通報ID: {r.id}</div>

                  <div>
                    投稿: {r.postTitle || '（タイトルなし）'}{' '}
                    {r.postId && (
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        ID: {r.postId}
                      </span>
                    )}
                  </div>

                  <div>通報者: {r.reporterEmail || '（不明）'}</div>
                  <div>理由: {r.reason || '(未入力)'}</div>

                  {/* 状態 + 日時 */}
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      日時:{' '}
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : '(不明)'}
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        padding: '3px 10px',
                        borderRadius: 999,
                        border: '1px solid',
                        whiteSpace: 'nowrap',
                        ...meta.style,
                      }}
                    >
                      {meta.text}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      gap: 8,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      disabled={done || busy}
                      onClick={() => handleResolve(r.id, 'reviewed')}
                      className="btn btn-primary btn-sm"
                      title={done ? '既に対応済み/却下済みです' : undefined}
                      style={done || busy ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      {busy ? '更新中…' : '対応済みにする'}
                    </button>

                    <button
                      type="button"
                      disabled={done || busy}
                      onClick={() => handleResolve(r.id, 'dismissed')}
                      className="btn btn-outline btn-sm"
                      title={done ? '既に対応済み/却下済みです' : undefined}
                      style={done || busy ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      {busy ? '更新中…' : '却下'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
