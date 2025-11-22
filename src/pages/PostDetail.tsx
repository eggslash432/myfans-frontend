// src/pages/posts/PostDetail.tsx
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, reportPost } from '../lib/api';
import type { Post } from '../shared/types';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const {user} = useAuth();
  const [busyPlan, setBusyPlan] = useState(false);
  const [busyPpv, setBusyPpv] = useState(false);  

  const q = useQuery({
    queryKey: ['post', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error('no id');
      // ★ api.get() は JSON をそのまま返す
      return await api.get<Post>(`/posts/${id}`);
    },
    retry: (c, err: any) => err?.response?.status !== 403 && c < 1,
  });

  // ★ PPV購入（単品購入）
  const buyPpv = async () => {
    if (!id) return;
    try {
      setBusyPpv(true);

      const successUrl = window.location.href; // 購入後このページに戻す
      const cancelUrl  = window.location.href;

      const res: any = await api.post('/payments/checkout', {
        postId: id,
        successUrl,
        cancelUrl,
      });

      // Stripe Checkout URL の取得
      const url =
        res?.url ??
        res?.checkoutUrl ??
        res?.sessionUrl ??
        res?.data?.url ??
        null;

      if (url) {
        window.location.href = url;
        return;
      }

      // ② sessionId + publishableKey 方式にフォールバック（必要なら）
      const { sessionId, pubKey, publishableKey } = res || {};
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
      alert(
        e?.response?.data?.message ?? '決済の開始に失敗しました',
      );
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
      const cancelUrl  = `${window.location.origin}/creators/${post.creatorId}`;

      const res: any = await api.post('/payments/checkout', {
        planId: post.planId,
        successUrl,
        cancelUrl,
      });

      const url =
        res?.url ??
        res?.checkoutUrl ??
        res?.sessionUrl ??
        res?.data?.url ??
        null;
      if (url) {
        window.location.href = url;
        return;
      }

      const { sessionId, pubKey, publishableKey } = res || {};
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

  const errorStatus = (q.error as any)?.response?.status;

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

  if (q.isError) {
    return <div className="p-6 text-red-600">読み込みに失敗しました</div>;
  }

  const post = q.data!;
  const isPpv = post.visibility === 'paid_single';
  const isPlan = post.visibility === 'plan';

  const handleReport = async () => {
    if (!user) {
      alert('通報するにはログインが必要です');
      // 必要なら /login に飛ばす
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

      <div className="prose whitespace-pre-wrap">
        {post.body ?? '（本文なし）'}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleReport}>通報する</button>
      </div>
    </article>
  );
}
