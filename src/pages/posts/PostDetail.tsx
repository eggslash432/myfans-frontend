// front/src/pages/posts/PostDetail.tsx
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  api,
  reportPost,
  ApiError,
  createPlanCheckoutSession,
  createPpvCheckoutSession,
} from '../../lib/api';
import type { Post } from '../../shared/types';
import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { MediaType } from '../../shared/prisma-enums';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?.replace(/\/api\/?$/, '')
  ?.replace(/\/$/, '');

const resolveMediaUrl = (url: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_ORIGIN) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [busyPlan, setBusyPlan] = useState(false);
  const [busyPpv, setBusyPpv] = useState(false);

  // ===== サンプル30秒制限 =====
  const SAMPLE_LIMIT_SEC = 30;

  // 動画ごとに「30秒到達したか」を保持（複数サンプル対応）
  const [sampleLockedMap, setSampleLockedMap] = useState<Record<string, boolean>>(
    {},
  );

  const lockSample = (key: string) => {
    setSampleLockedMap((prev) => ({ ...prev, [key]: true }));
  };

  const unlockSample = (key: string) => {
    setSampleLockedMap((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSampleTimeUpdate = (
    key: string,
    e: React.SyntheticEvent<HTMLVideoElement>,
  ) => {
    const v = e.currentTarget;

    if (v.currentTime >= SAMPLE_LIMIT_SEC) {
      v.pause();
      v.currentTime = SAMPLE_LIMIT_SEC;
      lockSample(key);
    }
  };  

  const q = useQuery<Post>({
    queryKey: ['post', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error('no id');
      const res = await api.get<Post>(`/posts/${id}`);
      return res.data;
    },
    retry: (c, err: any) =>
      !(err instanceof ApiError && err.status === 403) && c < 1,
  });

  /** 未ログインならログイン画面へ飛ばして true を返す */
  const requireLogin = () => {
    if (!user) {
      navigate('/login', {
        state: { from: location.pathname },
        replace: true,
      });
      return true;
    }
    return false;
  };

  const buyPpv = async () => {
    if (!id) return;
    if (requireLogin()) return;

    try {
      setBusyPpv(true);

      const { url } = await createPpvCheckoutSession(id);
      if (!url) throw new Error('Checkout URL が取得できませんでした');

      window.location.href = url;
    } catch (e: any) {
      console.error(e);

      if (e instanceof ApiError && e.status === 401) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      alert(e?.body?.message ?? e?.message ?? '決済の開始に失敗しました');
    } finally {
      setBusyPpv(false);
    }
  };

  const subscribePlan = async (post: Post) => {
    if (!post.creatorId || !post.planId) {
      alert('この投稿に紐づくプラン情報がありません');
      return;
    }
    if (requireLogin()) return;

    try {
      setBusyPlan(true);

      const { url } = await createPlanCheckoutSession(post.planId);
      if (!url) throw new Error('Checkout URL が取得できませんでした');

      window.location.href = url;
    } catch (e: any) {
      console.error(e);

      if (e instanceof ApiError && e.status === 401) {
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      alert(e?.body?.message ?? e?.message ?? 'プラン加入の開始に失敗しました');
    } finally {
      setBusyPlan(false);
    }
  };

  // ====== ローディング・エラー系 ======

  if (q.isLoading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">投稿を読み込み中です…</p>
        </section>
      </div>
    );
  }

  const errorStatus = q.error instanceof ApiError ? q.error.status : undefined;

  // 🔒 403 のとき：有料ロック画面（投稿詳細そのものが取れないケース）
  if (errorStatus === 403) {
    return (
      <div className="page">
        <section className="card post-detail-card">
          <h1 className="post-detail-title">この投稿は有料です</h1>
          <p className="section-subtitle">
            購読または単品購入が必要です。
          </p>

          <div className="post-detail-actions">
            <Link to="/login" className="btn btn-ghost">
              ログイン
            </Link>
            <Link to="/signup" className="btn btn-ghost">
              新規登録
            </Link>
            {/* ★ ここでは PPV かプランか分からないので購入ボタンは出さない */}
          </div>
        </section>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="page">
        <section className="card">
          <p className="settings-message settings-message-error">
            投稿の読み込みに失敗しました。
          </p>
        </section>
      </div>
    );
  }

  // ====== ここから本文表示 ======
  const post = q.data;

  // バックエンドからの media / mediaAssets / medias などをゆるく吸収
  const rawMedia =
    (post as any).mediaAssets ??
    (post as any).media ??
    (post as any).medias ??
    [];

  const mediaAssets = (rawMedia ?? []) as {
    id?: string;
    url: string;
    kind?: MediaType | string;
    mediaType?: MediaType | string;
    mimeType?: string;
    // ★ バックエンド側で isSample を返してもらう想定
    isSample?: boolean;
  }[];

  const isVideo = (asset: {
    url: string;
    mimeType?: string;
    kind?: string;
    mediaType?: string;
  }) => {
    const kind = (asset.kind ?? asset.mediaType ?? '').toString();
    if (kind === 'video') return true;
    if (asset.mimeType?.startsWith?.('video/')) return true;

    const u = asset.url.toLowerCase();
    return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
  };

  const isAudio = (asset: {
    url: string;
    mimeType?: string;
    kind?: string;
    mediaType?: string;
  }) => {
    const kind = (asset.kind ?? asset.mediaType ?? '').toString();
    if (kind === 'audio') return true;
    if (asset.mimeType?.startsWith?.('audio/')) return true;

    const u = asset.url.toLowerCase();
    return (
      u.endsWith('.mp3') ||
      u.endsWith('.wav') ||
      u.endsWith('.m4a') ||
      u.endsWith('.ogg')
    );
  };

  // ★ サンプルと本編を分離
  const sampleAssets = mediaAssets.filter((m) => (m as any).isSample);
  const mainAssets = mediaAssets.filter((m) => !(m as any).isSample);

  const isFree = post.visibility === 'free';
  const isPlan = post.visibility === 'plan';
  const isPpv = post.visibility === 'paid_single';

  // ★ R18 判定（プロパティ名は実プロジェクトに合わせて変えてね）
  const isR18 =
    (post as any).ageRating === 'r18' ||
    (post as any).isAdult === true;

  // ★ バックエンド側で canViewMain / canViewSample を返している場合も拾う
  const canViewMainFlag =
    (post as any).canViewMain ??
    (post as any).canView ??
    undefined;

  const canView = isFree ? true : canViewMainFlag === true;

  const canViewSample =
    (post as any).canViewSample ??
    (sampleAssets.length > 0); // 指定が無ければ「サンプルがあれば誰でも見れる」前提

  const isLocked = !canView && (isPlan || isPpv);

  const handleReport = async () => {
    if (!user) {
      alert('通報するにはログインが必要です');
      return;
    }
    const reason = window.prompt('通報理由を入力してください（任意）') ?? '';
    try {
      await reportPost(post.id, reason);
      alert('通報を受け付けました。ご協力ありがとうございます。');
    } catch (e) {
      console.error(e);
      alert('通報に失敗しました。時間をおいて再度お試しください。');
    }
  };

  // ★ サンプル動画のレンダリング（30秒制限つき）
  const renderSampleSection = () => {
    if (!canViewSample || sampleAssets.length === 0) return null;

    return (
      <section className="space-y-2 mb-4">
        <div className="post-detail-badge post-detail-badge-free">
          🎬 サンプル動画（最大{SAMPLE_LIMIT_SEC}秒）
        </div>

        <div className="space-y-3">
          {sampleAssets.map((asset, idx) => {
            const src = resolveMediaUrl(asset.url);
            const key = (asset.id ?? `sample-${idx}`).toString();

            // サンプルは基本 video 想定。video以外でも一応 video タグで再生を試みる
            const locked = sampleLockedMap[key] === true;

            return (
              <div key={key} className="w-full">
                <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                  <video
                    src={src}
                    controls
                    className="post-media"
                    onPlay={() => unlockSample(key)}
                    onTimeUpdate={(e) => handleSampleTimeUpdate(key, e)}
                  />
                </div>

                <div className="mt-1 text-xs text-gray-600">
                  ※ サンプルは {SAMPLE_LIMIT_SEC} 秒で自動停止します
                </div>

                {locked && (
                  <div className="mt-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                    サンプル視聴は {SAMPLE_LIMIT_SEC} 秒までです。続きは購入 / 購読してください。
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="page">
      <article className="card post-detail-card">
        {/* タイトル＋作者 */}
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <span className="post-detail-author">
              {post.creator?.publicName
                ? `by ${post.creator.publicName}`
                : 'by 運営'}
            </span>
          </div>

          {/* 種類・価格ラベル */}
          <div className="post-detail-tags">
            {isPpv && (
              <span className="post-detail-badge">
                単品価格{' '}
                {post.priceJpy != null
                  ? `¥${post.priceJpy.toLocaleString()}`
                  : '価格未設定'}
              </span>
            )}
            {isPlan && (
              <span className="post-detail-badge post-detail-badge-plan">
                プラン限定投稿
              </span>
            )}
            {isFree && (
              <span className="post-detail-badge post-detail-badge-free">
                無料投稿
              </span>
            )}
            {/* ★ R18 バッジ */}
            {isR18 && (
              <span className="post-detail-badge post-detail-badge-r18">
                R18
              </span>
            )}

            {/* プランで閲覧できている = 購読中 */}
            {isPlan && canView && (
              <span className="post-detail-badge">
                このプランを購読中
              </span>
            )}
          </div>
        </header>

        {/* 本文／ロック表示 */}
        <section className="post-detail-body">
          {/* ★ サンプルはロック状態に関係なく上部に表示 */}
          {renderSampleSection()}

          {!isLocked ? (
            // ====== 閲覧可能 ======
            <div className="space-y-4">
              {/* 本編メディア */}
              {mainAssets.length > 0 && (
                <div className="space-y-4">
                  {mainAssets.map((asset, idx) => {
                    const src = resolveMediaUrl(asset.url);

                    return (
                      <div
                        key={asset.id ?? idx}
                        className="w-full flex justify-center"
                      >
                        {isVideo(asset) ? (
                          <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                            <video
                              src={src}
                              controls
                              className="post-media"
                            />
                          </div>
                        ) : isAudio(asset) ? (
                          <div className="bg-black/5 rounded-2xl px-4 py-3 w-full flex items-center gap-3">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              音声
                            </span>
                            <audio src={src} controls className="w-full" />
                          </div>
                        ) : (
                          <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                            <img src={src} alt="" className="post-media" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 本文 */}
              <div className="post-detail-text">
                {post.body ?? '（本文なし）'}
              </div>
            </div>
          ) : (
            // ====== ロック表示（有料だけどまだ見れない） ======
            <div className="post-detail-locked">
              {isPlan ? (
                <p>この投稿は有料です。このプランへの加入が必要です。</p>
              ) : isPpv ? (
                <p>この投稿は有料です。この投稿の単品購入が必要です。</p>
              ) : (
                <p>この投稿は有料です。</p>
              )}

              <div className="post-detail-actions">
                {isPpv && (
                  <button
                    onClick={buyPpv}
                    disabled={busyPpv}
                    className="btn btn-primary"
                  >
                    {busyPpv ? '処理中…' : 'この投稿を単品購入'}
                  </button>
                )}

                {isPlan && post.planId && (
                  <button
                    onClick={() => subscribePlan(post)}
                    disabled={busyPlan}
                    className="btn btn-primary"
                  >
                    {busyPlan ? '処理中…' : 'このプランに加入する'}
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 通報ボタン */}
        <footer className="post-detail-footer">
          <button
            type="button"
            onClick={handleReport}
            className="btn btn-ghost btn-report"
          >
            <span>🚩</span>
            <span>この投稿を通報する</span>
          </button>
        </footer>
      </article>
    </div>
  );
}
