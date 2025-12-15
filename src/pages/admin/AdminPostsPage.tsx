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
import StatusBadge from '../../components/ui/StatusBadge';

function normalizeStatus(s: any): 'draft' | 'published' | 'private' {
  if (s === 'published') return 'published';
  if (s === 'private') return 'private';
  return 'draft';
}

function creatorLabel(p: AdminPost): string {
  const name = (p as any).creatorName?.trim?.() ? (p as any).creatorName : '';
  if (name) return name;

  const creatorId = (p as any).creatorId;
  if (creatorId) return `(${String(creatorId).slice(0, 8)}…)`; // デバッグ用

  // creatorId が null の投稿は管理者投稿など
  return '管理者';
}

export default function AdminPostsPage() {
  const [list, setList] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [reports, setReports] = useState<AdminPostReport[]>([]);
  const [reportsPostId, setReportsPostId] = useState<string | null>(null);
  // --- 検索/フィルタ/ソート ---
  const [q, setQ] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'private'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'free' | 'plan' | 'paid_single'>('all');

 type SortKey = 'createdAt' | 'publishedAt' | 'title' | 'reportsCount' | 'creatorName' | 'status';
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');  

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const data = await adminListPosts();
      setList(data);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) {
        setErr('AUTH_EXPIRED');
        setList([]);
        return;
      }
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

  const toggleSort = (key: SortKey, defaultDir: 'asc' | 'desc' = 'asc') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(defaultDir);
    }
  };

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };  

  const viewList = (() => {
    const keyword = q.trim().toLowerCase();

    const filtered = list.filter((p) => {
      const st = normalizeStatus((p as any).publishedStatus);
      if (filterStatus !== 'all' && st !== filterStatus) return false;

      const vis = (p as any).visibility as string | undefined;
      if (filterVisibility !== 'all' && vis !== filterVisibility) return false;

      if (!keyword) return true;

      const id = String(p.id ?? '').toLowerCase();
      const title = String(p.title ?? '').toLowerCase();
      const creator = String((p as any).creatorName ?? '').toLowerCase();

      return id.includes(keyword) || title.includes(keyword) || creator.includes(keyword);
    });

    const toTime = (v: any) => {
      if (!v) return 0;
      const t = new Date(v).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    const sorted = [...filtered].sort((a, b) => {
      const ak = sortKey;
      let av: any;
      let bv: any;

      if (ak === 'createdAt') {
        av = toTime((a as any).createdAt);
        bv = toTime((b as any).createdAt);
      } else if (ak === 'publishedAt') {
        av = toTime((a as any).publishedAt);
        bv = toTime((b as any).publishedAt);
      } else if (ak === 'title') {
        av = String((a as any).title ?? '');
        bv = String((b as any).title ?? '');
      } else if (ak === 'reportsCount') {
        av = Number((a as any).reportsCount ?? 0);
        bv = Number((b as any).reportsCount ?? 0);
      } else if (ak === 'creatorName') {
        av = String((a as any).creatorName ?? '');
        bv = String((b as any).creatorName ?? '');
      } else if (ak === 'status') {
        // published > private > draft の順（数値が大きいほど上位にする）
        const rank = (p: any) => {
          const st = normalizeStatus(p?.publishedStatus);
          if (st === 'published') return 3;
          if (st === 'private') return 2;
          return 1; // draft
        };
        av = rank(a);
        bv = rank(b);
      }  

      // string / number 両対応
      let cmp = 0;
      if (typeof av === 'string' || typeof bv === 'string') {
        cmp = String(av).localeCompare(String(bv), 'ja');
      } else {
        cmp = (av ?? 0) - (bv ?? 0);
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  })();  

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
    const isAuthExpired = err === 'AUTH_EXPIRED' || /unauthorized/i.test(err);

    return (
      <div className="page">
        <section className="card auth-card">
          <div className="auth-card-title">ログインが必要です</div>
          <p className="section-subtitle">
            セッションが切れました。もう一度ログインしてください。
          </p>

          <div className="auth-card-actions">
            <a className="btn btn-primary" href={`/login?next=${encodeURIComponent(location.pathname)}`}>
              ログインへ
            </a>
            <button className="btn btn-outline" onClick={() => location.reload()}>
              再読み込み
            </button>
          </div>
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

      <section className="card admin-filter">
        <div className="admin-filter-head">
          <div>
            <div className="section-title">検索・絞り込み</div>
            <div className="section-subtitle">投稿を素早く探して操作できます。</div>
          </div>

          <div className="admin-filter-actions">
            <button
              className="btn btn-outline"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              type="button"
            >
              {sortDir === 'asc' ? '昇順' : '降順'}
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                setQ('');
                setFilterStatus('all');
                setFilterVisibility('all');
                setSortKey('createdAt');
                setSortDir('desc');
              }}
              type="button"
            >
              リセット
            </button>
          </div>
        </div>

        <div className="admin-filter-grid2">
          {/* 1行目：検索（フル幅） */}
          <label className="admin-field admin-field--full">
            <span className="admin-field-label">検索</span>
            <input
              className="admin-input"
              placeholder="タイトル / 投稿ID / クリエイター名"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>

          {/* 2行目：状態・公開範囲・並び（3つ） */}
          <label className="admin-field">
            <span className="admin-field-label">状態</span>
            <select
              className="admin-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">すべて</option>
              <option value="published">公開</option>
              <option value="private">非公開</option>
              <option value="draft">下書き</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">公開範囲</span>
            <select
              className="admin-select"
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value as any)}
            >
              <option value="all">すべて</option>
              <option value="free">無料</option>
              <option value="plan">プラン</option>
              <option value="paid_single">PPV</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-field-label">並び</span>
            <select
              className="admin-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
            >
              <option value="createdAt">作成日</option>
              <option value="publishedAt">公開日</option>
              <option value="title">タイトル</option>
              <option value="creatorName">クリエイター</option>
              <option value="reportsCount">通報数</option>
              <option value="status">状態</option>
            </select>
          </label>
        </div>

        <div className="admin-filter-foot">
          <div className="admin-filter-count">表示件数: {viewList.length} 件</div>
          <div className="admin-filter-hint">
            ※テーブルのヘッダークリックでも並び替えできます
          </div>
        </div>
      </section>   

      {/* ===== Mobile: cards ===== */}
      <div className="admin-only-mobile admin-cards">
        {list.length === 0 ? (
          <section className="card" style={{ background: '#f9fafb' }}>
            <p className="section-subtitle">投稿がありません。</p>
          </section>
        ) : (
          viewList.map((p) => {
            const st = normalizeStatus((p as any).publishedStatus);

            return (
              <div key={p.id} className="admin-post-card">
                <div className="admin-post-title">{p.title || '（無題）'}</div>

                <div className="admin-post-dates text-xs text-gray-500" style={{ marginTop: 4 }}>
                  <div>
                    作成日：
                    {new Date((p as any).createdAt).toLocaleString()}
                  </div>
                  <div>
                    公開日：
                    {(p as any).publishedAt
                      ? new Date((p as any).publishedAt).toLocaleString()
                      : '-'}
                  </div>
                </div>                

                <div className="admin-post-meta">
                  <span>Creator: {creatorLabel(p)}</span>
                  <StatusBadge publishedStatus={p.publishedStatus} visibility={p.visibility} />
                </div>

                <div className="admin-post-actions">
                  {st === 'published' ? (
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => updateStatus(p.id, 'private')}
                    >
                      非公開
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => updateStatus(p.id, 'published')}
                    >
                      公開
                    </button>
                  )}

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
            );
          })
        )}
      </div>

      {/* ===== Desktop: table ===== */}
      <div className="admin-only-desktop admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 220 }}>投稿ID</th>

              <th
                style={{ width: 140, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('createdAt', 'desc')}
                title="作成日で並び替え"
              >
                作成日{sortMark('createdAt')}
              </th>

              <th
                style={{ width: 140, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('publishedAt', 'desc')}
                title="公開日で並び替え"
              >
                公開日{sortMark('publishedAt')}
              </th>

              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('title', 'asc')}
                title="タイトルで並び替え"
              >
                タイトル{sortMark('title')}
              </th>

              <th
                style={{ width: 140, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('creatorName', 'asc')}
                title="クリエイターで並び替え"
              >
                クリエイター{sortMark('creatorName')}
              </th>

              <th
                style={{ width: 110, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('status', 'desc')}
                title="状態で並び替え（published > private > draft）"
              >
                状態{sortMark('status')}
              </th>

              <th
                style={{ width: 120, cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('reportsCount', 'desc')}
                title="通報数で並び替え"
              >
                通報{sortMark('reportsCount')}
              </th>

              <th style={{ width: 260 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: '#6b7280' }}>
                  投稿がありません。
                </td>
              </tr>
            ) : (
              viewList.map((p) => {
                const st = normalizeStatus((p as any).publishedStatus);

                return (
                  <tr key={p.id}>
                    <td className="admin-id" title={p.id}>
                      {p.id}
                    </td>

                    <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: 12 }}>
                      {new Date((p as any).createdAt).toLocaleString()}
                    </td>

                    <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: 12 }}>
                      {(p as any).publishedAt
                        ? new Date((p as any).publishedAt).toLocaleString()
                        : '-'}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{p.title || '（無題）'}</div>
                    </td>

                    <td>{creatorLabel(p)}</td>

                    <td>
                      <StatusBadge publishedStatus={p.publishedStatus} visibility={p.visibility} />
                    </td>

                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {(p as any).reportsCount ?? 0}
                    </td>

                    <td>
                      <div className="admin-actions">
                        {normalizeStatus((p as any).publishedStatus) === 'published' ? (
                          <button className="btn btn-outline btn-xs" onClick={() => updateStatus(p.id, 'private')}>
                            非公開
                          </button>
                        ) : (
                          <button className="btn btn-outline btn-xs" onClick={() => updateStatus(p.id, 'published')}>
                            公開
                          </button>
                        )}

                        <button className="btn btn-outline btn-xs" onClick={() => openReports(p.id)}>
                          通報
                        </button>

                        <button className="btn btn-primary btn-xs" onClick={() => deletePost(p.id)}>
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
