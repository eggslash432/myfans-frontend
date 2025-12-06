// front/src/pages/CreatorPage.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { Creator, PostSummary } from '../../shared/types';
import { useAuth } from '../../hooks/useAuth';

export default function CreatorPage() {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMyself = user && creator && user.id === (creator as any).id;

  useEffect(() => {
    (async () => {
      if (!id) {
        setError('クリエイターが見つかりません');
        setLoading(false);
        return;
      }

      try {
        // クリエイター情報と投稿一覧を並列で取得
        const [creatorRes, postsRes] = await Promise.all([
          api.get<Creator>(`/creators/${id}`),
          api.getCreatorPosts(id),
        ]);

        setCreator(creatorRes.data);
        setPosts(postsRes.data ?? []);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? 'ロードに失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ▼ 購読処理（Stripe Checkout 開始）
  async function onSubscribe(planId: string) {
    if (!id) return;

    // 🔒 未ログインならログイン画面へ
    if (!user) {
      navigate('/login', {
        state: { from: location.pathname }, // ログイン後に戻ってくる用
        replace: true,
      });
      return;
    }

    try {
      const res = await api.post<{ url: string }>(
        `/creators/${id}/plans/${planId}/checkout`,
      );

      const url = res.data?.url;
      if (!url) throw new Error('Checkout URL が取得できませんでした');

      window.location.href = url;
    } catch (e: any) {
      console.error(e);

      const status = e?.response?.status;
      if (status === 401) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      const msg =
        e?.response?.data?.message ??
        e?.message ??
        'Checkoutの作成に失敗しました';
      alert(msg);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">クリエイター情報を読み込み中です…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="card">
          <p className="text-sm text-red-600">{error}</p>
        </section>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">クリエイターが見つかりませんでした。</p>
        </section>
      </div>
    );
  }

  const displayName =
    (creator as any).publicName ??
    (creator as any).displayName ??
    (creator as any).name ??
    'クリエイター';

  const initial = displayName.trim().charAt(0).toUpperCase() || 'C';
  const planCount = creator.plans?.length ?? 0;
  const postCount = posts.length;

  // 投稿の visibility をちょっとだけ人間向けに
  const visibilityLabel = (v: PostSummary['visibility']) => {
    switch (v) {
      case 'free':
        return '無料';
      case 'plan':
        return 'プラン限定';
      case 'paid_single':
        return 'PPV';
      default:
        return '';
    }
  };

  return (
    <div className="page space-y-4">
      {/* クリエイターのヘッダー */}
      <section className="card flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500 flex-shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{displayName}</h1>
          {creator.bio ? (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {creator.bio}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              自己紹介はまだ登録されていません。
            </p>
          )}
        </div>
      </section>

      {/* プラン一覧 */}
      <section className="card">
        <div className="section-title flex items-center justify-between">
          <span>プラン</span>
          <span className="text-xs text-gray-400">全 {planCount} 件</span>
        </div>

        {planCount === 0 && (
          <p className="section-subtitle">
            まだ公開中のプランはありません。
          </p>
        )}

        {planCount > 0 && (
          <div className="grid grid-cols-1 gap-3 mt-2">
            {creator.plans!.map((p) => (
              <div
                key={p.id}
                className="border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ¥{(p.priceJpy ?? 0).toLocaleString()}/月
                  </div>
                </div>

                {!isMyself && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onSubscribe(p.id)}
                  >
                    購読する
                  </button>
                )}
                {isMyself && (
                  <p className="text-xs text-gray-500">
                    ※自分のプランは購読できません
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 投稿一覧 */}
      <section className="card">
        <div className="section-title flex items-center justify-between">
          <span>投稿</span>
          <span className="text-xs text-gray-400">全 {postCount} 件</span>
        </div>

        {postCount === 0 && (
          <p className="section-subtitle">まだ公開中の投稿はありません。</p>
        )}

        {postCount > 0 && (
          <div className="post-list">
            {posts.map((post) => {
              const dateStr = new Date(
                post.publishedAt ?? post.createdAt,
              ).toLocaleDateString("ja-JP");

              const statusLabel =
                post.publishedStatus === "published"
                  ? "公開中"
                  : post.publishedStatus === "draft"
                  ? "下書き"
                  : "非公開";

              return (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="post-list-item card-link"
                >
                  {/* 上段：日付＋ステータス */}
                  <div className="post-list-meta">
                    <span className="post-list-date">{dateStr}</span>
                    <span className="post-list-status">{statusLabel}</span>
                  </div>

                  {/* タイトル */}
                  <div className="post-list-title">
                    {post.title || "無題の投稿"}
                  </div>

                  {/* 下段：公開範囲＋価格 */}
                  <div className="post-list-tags">
                    <span className="post-list-badge">
                      {visibilityLabel(post.visibility)}
                    </span>

                    {post.visibility === "paid_single" && post.priceJpy != null && (
                      <span className="post-list-price">
                        ¥{post.priceJpy.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
