import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../lib/http';
import PostGrid, { type PostItem } from '../../components/PostGrid';

type Creator = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

export default function CreatorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        // バックエンドのレスポンス形式: { items: [ { id,title,isFree,price } ] }
        const res = await apiGet<any>(`/creators/${id}/posts`);
        console.log('APIレスポンス /creators/:id/posts:', res);

        const mapped: PostItem[] = (res.items ?? []).map((p: any) => ({
          id: String(p.id),
          title: String(p.title ?? '無題'),
          coverUrl: p.coverUrl ?? p.thumbnail ?? null,
          excerpt: p.excerpt ?? p.summary ?? null,
          isFree: !!p.isFree,
          isAccessible: !!p.isAccessible, // 未定義なら false → 購入ボタン表示
          price: typeof p.price === 'number' ? p.price : (p.ppvPrice ?? null),
        }));

        setPosts(mapped);
        setCreator({
          id,
          displayName: `Creator ${id.slice(0, 6)}`,
          avatarUrl: null,
          bio: null,
        });
      } catch (e) {
        console.error(e);
        alert('投稿一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onOpen = (postId: string) => navigate(`/posts/${postId}`);

  const header = useMemo(() => {
    if (!creator) return null;
    return (
      <div className="flex items-center gap-3">
        <img
          src={creator.avatarUrl || '/avatar.svg'}
          alt={creator.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h1 className="text-xl font-bold">{creator.displayName}</h1>
          {creator.bio && <p className="text-sm text-gray-500">{creator.bio}</p>}
        </div>
      </div>
    );
  }, [creator]);

  return (
    <main className="max-w-5xl mx-auto p-4">
      {loading && <div className="py-12 text-center">読み込み中…</div>}
      {!loading && (
        <>
          {header}
          <div className="mt-6">
            <PostGrid posts={posts} onOpen={onOpen} />
          </div>
        </>
      )}
    </main>
  );
}
