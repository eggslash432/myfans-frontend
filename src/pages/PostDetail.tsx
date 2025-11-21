// src/pages/posts/PostDetail.tsx
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Post } from '../shared/types';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();

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
      const res: any = await api.post('/posts/checkout/post', { postId: id });

      // Stripe Checkout URL の取得
      const url =
        res?.url ??
        res?.checkoutUrl ??
        res?.sessionUrl ??
        res?.data?.url ??
        null;

      if (url) {
        window.location.href = url;
      } else {
        alert('決済URLの取得に失敗しました');
      }
    } catch (e: any) {
      const status = e?.response?.status;

      if (status === 401) {
        alert('ログインが必要です');
      } else if (status === 400) {
        alert(e?.response?.data?.message ?? '購入できません');
      } else {
        console.error(e);
        alert('決済の開始に失敗しました');
      }
    }
  };

  if (q.isLoading) {
    return <div className="p-6 text-center text-gray-500">読み込み中…</div>;
  }

  const errorStatus = (q.error as any)?.response?.status;

  // ★403 → PPV / サブスク未加入時のロック画面
  if (errorStatus === 403) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-3">
        <div className="text-lg font-semibold">この投稿は有料です</div>
        <div className="text-sm text-gray-600">購入またはプラン加入が必要です</div>

        <div className="flex justify-center gap-3 mt-4">
          <Link to="/login" className="px-3 py-2 border rounded">
            ログイン
          </Link>
          <Link to="/signup" className="px-3 py-2 border rounded">
            新規登録
          </Link>
          <button
            onClick={buyPpv}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            単品購入
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

  return (
    <article className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {/* ▼ 価格 / タイプラベル */}
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

      <div className="prose whitespace-pre-wrap">{post.body}</div>
    </article>
  );
}
