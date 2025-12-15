// front/src/pages/admin/AdminPostsPage.tsx
import { useEffect, useState } from 'react';
import { ApiError } from '../../lib/api/apiClient';
import {
  adminListPosts,
  adminDeletePost,
  adminUpdatePostStatus,
  adminGetPostReports,
  adminResolvePostReport,
} from '../../lib/api/admin';
import type { AdminPost, AdminPostReport } from '../../shared/types';

function StatusBadge({ status }: { status: string }) {
  const normalized =
    status === 'published' ? 'published'
    : status === 'private' ? 'private'
    : 'draft';

  const cls =
    normalized === 'published'
      ? 'badge badge-published'
      : normalized === 'private'
        ? 'badge badge-private'
        : 'badge badge-draft';

  const label =
    normalized === 'published' ? '公開'
    : normalized === 'private' ? '非公開'
    : '下書き';

  return <span className={cls}>{label}</span>;
}

export default function AdminPostsPage() {
  const [list, setList] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [reports, setReports] = useState<AdminPostReport[]>([]);
  const [reportsPostId, setReportsPostId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const data = await adminListPosts();
      setList(data);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 404) {
        console.warn('/admin/posts 未実装のため空リスト扱い', e);
        setList([]);
        setErr('');
      } else {
        console.error(e);
        setErr(e?.message ?? '投稿一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function deletePost(id: string) {
    if (!confirm('この投稿を削除しますか？この操作は元に戻せません。')) return;
    try {
      await adminDeletePost(id);
      await load();
    } catch (e: any) {
      alert(e?.message ?? '削除に失敗しました');
    }
  }

  async function updateStatus(id: string, status: 'draft' | 'published' | 'private') {
    if (!confirm(`この投稿の状態を「${status}」に変更しますか？`)) return;
    try {
      await adminUpdatePostStatus(id, status);
      await load();
    } catch (e: any) {
      alert(e?.message ?? '状態変更に失敗しました');
    }
  }

  async function openReports(postId: string) {
    try {
      const data = await adminGetPostReports(postId);
      setReports(data);
      setReportsPostId(postId);
    } catch (e: any) {
      alert(e?.message ?? '通報一覧の取得に失敗しました');
    }
  }

  async function resolveReport(reportId: string) {
    try {
      await adminResolvePostReport(reportId);
      if (reportsPostId) {
        const data = await adminGetPostReports(reportsPostId);
        setReports(data);
      }
    } catch (e: any) {
      alert(e?.message ?? '通報の更新に失敗しました');
    }
  }

  const closeModal = () => {
    setReportsPostId(null);
    setReports([]);
  };  

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">読み込み中…</p>
        </section>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <section className="card">
          <p className="text-sm text-red-600">{err}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page space-y-4">
      <section className="card">
        <div className="section-title">投稿管理（Admin）</div>
        <p className="section-subtitle">投稿の削除・非公開・通報確認ができます。</p>
      </section>

      {/* ===== Mobile: cards ===== */}
      <div className="admin-only-mobile admin-cards">
        {list.length === 0 ? (
          <section className="card" style={{ background: '#f9fafb' }}>
            <p className="section-subtitle">投稿がありません。</p>
          </section>
        ) : (
          list.map((p) => (
            <div key={p.id} className="admin-post-card">
              <div className="admin-post-title">{p.title || '（無題）'}</div>

              <div className="admin-post-meta">
                <span>Creator: {p.creator?.publicName ?? '-'}</span>
                <StatusBadge status={p.publishedStatus} />
              </div>

              <div className="admin-post-actions">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => updateStatus(p.id, 'private')}
                >
                  非公開
                </button>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => openReports(p.id)}
                >
                  通報
                </button>
                <button
                  className="btn btn-primary btn-xs"
                  onClick={() => deletePost(p.id)}
                >
                  削除
                </button>
              </div>

              <div className="admin-post-idline" title={p.id}>
                ID: {p.id}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== Desktop: table ===== */}
      <div className="admin-only-desktop admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>投稿ID</th>
              <th>タイトル</th>
              <th style={{ width: 140 }}>クリエイター</th>
              <th style={{ width: 110 }}>状態</th>
              <th style={{ width: 260 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: '#6b7280' }}>
                  投稿がありません。
                </td>
              </tr>
            ) : (
              list.map((p) => (
                <tr key={p.id}>
                  <td className="admin-id" title={p.id}>{p.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.title || '（無題）'}</div>
                  </td>
                  <td>{p.creator?.publicName ?? '-'}</td>
                  <td><StatusBadge status={p.publishedStatus} /></td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => updateStatus(p.id, 'private')}
                      >
                        非公開
                      </button>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => openReports(p.id)}
                      >
                        通報
                      </button>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => deletePost(p.id)}
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reportsPostId && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div>
                <div className="section-title" style={{ marginBottom: 2 }}>通報一覧</div>
                <div className="section-subtitle">Post ID: {reportsPostId}</div>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
              >
                閉じる
              </button>
            </div>

            {reports.length === 0 ? (
              <section className="card" style={{ background: '#f9fafb' }}>
                <p className="section-subtitle">通報はありません。</p>
              </section>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <section key={r.id} className="card" style={{ padding: 12 }}>
                    <div className="text-xs" style={{ color: '#6b7280' }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6, fontWeight: 700 }}>理由</div>
                    <div className="text-sm">{r.reason}</div>

                    <div style={{ marginTop: 8 }} className="text-xs">
                      ステータス:{' '}
                      {r.resolved ? (
                        <span style={{ color: '#065f46', fontWeight: 700 }}>対応済み</span>
                      ) : (
                        <span style={{ color: '#991b1b', fontWeight: 700 }}>未対応</span>
                      )}
                    </div>

                    {!r.resolved && (
                      <div style={{ marginTop: 10 }}>
                        <button className="btn btn-primary btn-xs" onClick={() => resolveReport(r.id)}>
                          対応済みにする
                        </button>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
