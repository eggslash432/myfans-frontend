// front/src/pages/creators/CreatorPostsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { PostSummary } from '../../shared/types';

export default function CreatorPostsPage() {
  const [items, setItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const data = await api.myPosts(); // /posts/me
        setItems(data ?? []);
      } catch (e: any) {
        console.error('load my posts failed', e);
        setErr(e?.message ?? '投稿一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page space-y-4">
      <h1 className="page-title">投稿管理</h1>
      <section className="card space-y-3">
        <div className="flex justify-between items-center">
          <div className="section-title">自分の投稿一覧</div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/posts/new')}
          >
            新規投稿
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <p className="text-sm text-gray-500">まだ投稿がありません。</p>
        )}

        {!loading && !err && items.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {items.map((p) => (
              <li
                key={p.id}
                className="py-2 flex items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.publishedStatus === 'published' ? '公開中' : '下書き'}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-pink-500 underline ml-2"
                  onClick={() => navigate(`/posts/${p.id}`)}
                >
                  詳細
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
