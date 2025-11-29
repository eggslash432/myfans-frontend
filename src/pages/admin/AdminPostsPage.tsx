// src/pages/admin/AdminPostsPage.tsx
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../lib/api';

type AdminPost = {
  id: string;
  title: string;
  publishedStatus: 'draft' | 'published' | 'private';
  creator?: {
    publicName?: string;
  };
};

type Report = {
  id: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
};

export default function AdminPostsPage() {
  const [list, setList] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsPostId, setReportsPostId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr('');
      const res = await api.get<AdminPost[]>('/admin/posts');
      setList(res.data);
    } catch (e: any) {
      // ★ 404（API 未実装）のときは「空リスト」として扱う
      if (e instanceof ApiError && e.status === 404) {
        console.warn('/admin/posts が未実装のため空リスト扱いにします', e);
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
    load();
  }, []);

  // 投稿削除
  async function deletePost(id: string) {
    if (!confirm('この投稿を削除しますか？この操作は元に戻せません。')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      await load();
    } catch (e: any) {
      alert(e?.message ?? '削除に失敗しました');
    }
  }

  // 公開状態変更
  async function updateStatus(id: string, status: 'draft' | 'published' | 'private') {
    if (!confirm(`この投稿の状態を「${status}」に変更しますか？`)) return;
    try {
      await api.patch(`/admin/posts/${id}/status`, { status });
      await load();
    } catch (e: any) {
      alert(e?.message ?? '状態変更に失敗しました');
    }
  }

  // 通報一覧を開く
  async function openReports(postId: string) {
    try {
      const res = await api.get(`/admin/posts/${postId}/reports`);
      setReports(res.data);
      setReportsPostId(postId);
    } catch (e: any) {
      alert(e?.message ?? '通報一覧の取得に失敗しました');
    }
  }

  // 通報を対応済みにする
  async function resolveReport(reportId: string) {
    try {
      await api.patch(`/admin/posts/reports/${reportId}/resolve`);
      if (reportsPostId) {
        // モーダル内一覧をリロード
        const res = await api.get(`/admin/posts/${reportsPostId}/reports`);
        setReports(res.data);
      }
    } catch (e: any) {
      alert(e?.message ?? '通報の更新に失敗しました');
    }
  }

  if (loading) return <div>読み込み中…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">投稿管理（Admin）</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">投稿ID</th>
            <th className="py-2 text-left">タイトル</th>
            <th className="py-2 text-left">クリエイター</th>
            <th className="py-2 text-left">状態</th>
            <th className="py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.id}</td>
              <td className="py-2">{p.title}</td>
              <td className="py-2">{p.creator?.publicName ?? '-'}</td>
              <td className="py-2">{p.publishedStatus}</td>
              <td className="py-2 space-x-2">
                <button
                  onClick={() => deletePost(p.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  削除
                </button>

                <button
                  onClick={() => updateStatus(p.id, 'private')}
                  className="ml-2 px-3 py-1 bg-gray-600 text-white rounded"
                >
                  非公開
                </button>

                <button
                  onClick={() => openReports(p.id)}
                  className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded"
                >
                  通報
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 通報一覧の簡易モーダル */}
      {reportsPostId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded shadow p-4 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">通報一覧（Post ID: {reportsPostId}）</h2>
              <button
                onClick={() => {
                  setReportsPostId(null);
                  setReports([]);
                }}
              >
                閉じる
              </button>
            </div>

            {reports.length === 0 && <p>通報はありません。</p>}

            {reports.map((r) => (
              <div key={r.id} className="border-b py-2">
                <div className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="text-sm">理由: {r.reason}</div>
                <div className="text-xs">
                  ステータス:{' '}
                  {r.resolved ? (
                    <span className="text-green-600">対応済み</span>
                  ) : (
                    <span className="text-red-600">未対応</span>
                  )}
                </div>
                {!r.resolved && (
                  <button
                    onClick={() => resolveReport(r.id)}
                    className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    対応済みにする
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
