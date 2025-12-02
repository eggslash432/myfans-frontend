// front/src/pages/posts/PostDetail.tsx

import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, reportPost, ApiError } from '../../lib/api';
import type { Post } from '../../shared/types';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { MediaType } from '../../shared/prisma-enums';

type CheckoutResponse = {
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
  pubKey?: string;
  publishableKey?: string;
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [busyPlan, setBusyPlan] = useState(false);
  const [busyPpv, setBusyPpv] = useState(false);

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

  // ★ PPV購入（単品購入）
  const buyPpv = async () => {
    if (!id) return;
    try {
      setBusyPpv(true);

      const successUrl = window.location.href; // 購入後このページに戻す
      const cancelUrl = window.location.href;

      const res = await api.post<CheckoutResponse>('/payments/checkout', {
        postId: id,
        successUrl,
        cancelUrl,
      });
      const payload = res.data;

      // Stripe Checkout URL の取得
      const url =
        payload.url ??
        payload.checkoutUrl ??
        payload.sessionUrl ??
        null;

      if (url) {
        window.location.href = url;
        return;
      }

      // ② sessionId + publishableKey 方式にフォールバック（必要なら）
      const { sessionId, pubKey, publishableKey } = payload;
      const pk = pubKey ?? publishableKey;
      if (!sessionId || !pk) {
        throw new Error('Checkout情報が不足しています');
      }
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(pk);
      if (!stripe) throw new Error('Stripe初期化に失敗しました');
      await (stripe as any).redirectToCheckout({ sessionId });
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? '決済の開始に失敗しました');
    } finally {
      setBusyPpv(false);
    }
  };

  // ▼ サブスク加入（プラン購読）
  const subscribePlan = async (post: Post) => {
    if (!post.creatorId || !post.planId) {
      alert('この投稿に紐づくプラン情報がありません');
      return;
    }
    try {
      setBusyPlan(true);

      const successUrl = `${window.location.origin}/creators/${post.creatorId}?subscribed=1`;
      const cancelUrl = `${window.location.origin}/creators/${post.creatorId}`;

      const res = await api.post<CheckoutResponse>('/payments/checkout', {
        planId: post.planId,
        successUrl,
        cancelUrl,
      });
      const payload = res.data;

      const url =
        payload.url ??
        payload.checkoutUrl ??
        payload.sessionUrl ??
        null;
      if (url) {
        window.location.href = url;
        return;
      }

      const { sessionId, pubKey, publishableKey } = payload;
      const pk = pubKey ?? publishableKey;
      if (!sessionId || !pk) {
        throw new Error('Checkout情報が不足しています');
      }
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripe = await loadStripe(pk);
      if (!stripe) throw new Error('Stripe初期化に失敗しました');
      await (stripe as any).redirectToCheckout({ sessionId });
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401) {
        alert('ログインが必要です');
      } else {
        console.error(e);
        alert(
          e?.response?.data?.message ??
            'プラン加入の開始に失敗しました',
        );
      }
    } finally {
      setBusyPlan(false);
    }
  };

  if (q.isLoading) {
    return <div className="p-6 text-center text-gray-500">読み込み中…</div>;
  }

  const errorStatus =
    q.error instanceof ApiError ? q.error.status : undefined;

  if (errorStatus === 403) {
    // バックエンドが 403 を返す設計のとき用のロック画面
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-3">
        <div className="text-lg font-semibold">この投稿は有料です</div>
        <div className="text-sm text-gray-600">
          購読または単品購入が必要です
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Link to="/login" className="px-3 py-2 border rounded">
            ログイン
          </Link>
          <Link to="/signup" className="px-3 py-2 border rounded">
            新規登録
          </Link>
          <button
            onClick={buyPpv}
            disabled={busyPpv}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busyPpv ? '処理中…' : '単品購入'}
          </button>
        </div>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return <div className="p-6 text-red-600">読み込みに失敗しました</div>;
  }

  // ✅ ここで Post 型として確定
  const post = q.data;
  // ★ 追加: メディア一覧（型は一旦 any で受ける）
  const mediaAssets = ((post as any).mediaAssets ?? []) as {
    id?: string;
    url: string;
    kind?: MediaType;
    mimeType?: string;
  }[];  
  const isVideo = (asset: { url: string; mimeType?: string; kind?: string }) => {
    if (asset.kind === 'video') return true;
    if (asset.mimeType?.startsWith('video/')) return true;

    const u = asset.url.toLowerCase();
    return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
  };  
  const isPpv = post.visibility === 'paid_single';
  const isPlan = post.visibility === 'plan';

  // 無料投稿なら無条件で閲覧OK、それ以外は canView を見る
  const canView =
    post.visibility === 'free'
      ? true
      : (post as any).canView === true;

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

  return (
    <article className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {/* ▼ 投稿者表示（creator がいなければ「運営」扱い） */}
      <div className="text-sm text-gray-500">
        {post.creator?.publicName
          ? `by ${post.creator.publicName}`
          : 'by 運営'}
      </div>      

      {/* ▼ 種類・価格ラベル */}
      <div className="text-sm text-gray-600 space-x-2">
        {isPpv && (
          <span>
            単品価格:{' '}
            {post.priceJpy != null
              ? `¥${post.priceJpy.toLocaleString()}`
              : '価格未設定'}
          </span>
        )}
        {isPlan && <span>プラン限定投稿</span>}
        {!isPpv && !isPlan && <span>無料投稿</span>}
      </div>

      {/* ▼ プラン投稿のときに「このプランに加入する」ボタン */}
      {isPlan && post.planId && (
        <div className="mt-3">
          <button
            onClick={() => subscribePlan(post)}
            disabled={busyPlan}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busyPlan ? '処理中…' : 'このプランに加入する'}
          </button>
        </div>
      )}

      <div className="mt-4">
        {canView ? (
          <div className="space-y-4">
            {/* ★ メディア表示 */}
            {mediaAssets.length > 0 && (
              <div className="space-y-3">
                {mediaAssets.map((asset, idx) => (
                  <div key={asset.id ?? idx} className="w-full">
                    {isVideo(asset) ? (
                      <video
                        src={asset.url}
                        controls
                        className="w-full rounded-lg shadow"
                      />
                    ) : (
                      <img
                        src={asset.url}
                        alt=""
                        className="w-full rounded-lg shadow object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ★ 本文 */}          
            <div className="prose whitespace-pre-wrap">
              {post.body ?? '（本文なし）'}
            </div>
          </div>  
        ) : (
          <div className="space-y-3 text-center text-sm text-gray-700">
            <p>この投稿は有料です。購読またはPPV購入が必要です。</p>

            <div className="flex justify-center gap-3 mt-2">
              {isPpv && (
                <button
                  onClick={buyPpv}
                  disabled={busyPpv}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {busyPpv ? '処理中…' : 'この投稿を単品購入'}
                </button>
              )}

              {isPlan && post.planId && (
                <button
                  onClick={() => subscribePlan(post)}
                  disabled={busyPlan}
                  className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {busyPlan ? '処理中…' : 'このプランに加入する'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleReport}
          className="btn btn-sm btn-ghost btn-report"
        >
          <span>🚩</span>
          <span>この投稿を通報する</span>
        </button>
      </div>
    </article>
  );
}
