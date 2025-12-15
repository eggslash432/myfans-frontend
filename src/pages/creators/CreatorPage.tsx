// front/src/pages/CreatorPage.tsx
import { useEffect, useState } from 'react';
import { API_ORIGIN, ApiError } from '../../lib/api/apiClient';
import { createPlanCheckoutSession } from '../../lib/api/payments';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import type { Creator, PostSummary } from '../../shared/types';
import { useAuth } from '../../hooks/useAuth';
import { 
  getCreatorPosts, 
  getCreatorPublicProfile 
} from '../../lib/api/creators';

export default function CreatorPage() {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

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
          getCreatorPublicProfile(id),
          getCreatorPosts(id),
        ]);

        setCreator(creatorRes);
        setPosts(postsRes.items ?? []);
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
        state: { from: location.pathname },
        replace: true,
      });
      return;
    }

    try {
      setBusyPlanId(planId);

      const { url } = await createPlanCheckoutSession(planId);
      if (!url) {
        throw new Error('Checkout URL が取得できませんでした');
      }

      window.location.href = url;
    } catch (e: any) {
      console.error(e);

      // ApiError（ラッパ）経由で 401 が来たとき
      if (e instanceof ApiError && e.status === 401) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      const msg =
        (e as any)?.body?.message ??
        (e as any)?.message ??
        'Checkoutの作成に失敗しました';
      alert(msg);
    } finally {
      setBusyPlanId(null);
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

  // ★ 追加: avatarSrc をサーバの相対パスから組み立てる
  const rawAvatarUrl = (creator as any).avatarUrl as string | undefined;
  const avatarSrc = rawAvatarUrl
    ? rawAvatarUrl.startsWith('http')
      ? rawAvatarUrl
      : `${API_ORIGIN}${rawAvatarUrl}`
    : null;

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
        {/* アイコン画像 or ダミー丸 */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="profile-avatar-preview"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
        )}

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
                    disabled={busyPlanId === p.id}
                    onClick={() => onSubscribe(p.id)}
                  >
                    {busyPlanId === p.id ? '処理中…' : '購読する'}
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
