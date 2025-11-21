// src/pages/admin/AdminPostsPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminPostsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get('/admin/posts');
    setList(res);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    await api.delete(`/admin/posts/${id}`);
    await load();
  };

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/posts/${id}/status`, {
      publishedStatus: status,
    });
    await load();
  };

  if (loading) return <div>読み込み中…</div>;

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
              <td className="py-2">{p.creator?.publicName}</td>
              <td className="py-2">{p.publishedStatus}</td>
              <td className="py-2 space-x-2">
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => setStatus(p.id, 'private')}
                >
                  非公開
                </button>
                <button
                  className="px-2 py-1 border rounded"
                  onClick={() => setStatus(p.id, 'published')}
                >
                  公開
                </button>
                <button
                  className="px-2 py-1 border rounded bg-red-500 text-white"
                  onClick={() => remove(p.id)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}