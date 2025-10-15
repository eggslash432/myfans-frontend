import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

type Post = { id:string; title:string; bodyMd?:string; visibility:'free'|'plan'|'paid_single'; creatorId:string; planId?:string|null; };

export default function PostDetail() {
  const { id } = useParams<{id:string}>();

  const q = useQuery({
    queryKey: ['post', id],
    queryFn: async () => (await api.get<Post>(`/posts/${id}`)).data,
    retry: (c, err:any) => err?.response?.status !== 403 && c < 1,
  });

  if (q.isLoading) return <div className="p-6">読み込み中…</div>;
  const status = (q.error as any)?.response?.status;

  // 403 なら導線を出す（プラン/PPV共通）
  if (status === 403) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-3">
        <div className="text-lg font-semibold">この投稿は有料です</div>
        <div className="text-sm text-gray-600">ログインまたは購入/プラン加入が必要です</div>
        <div className="flex gap-2 justify-center">
          <Link className="px-3 py-2 border rounded" to="/login">ログイン</Link>
          <Link className="px-3 py-2 border rounded" to="/signup">新規登録</Link>
          {/* PPV購入ボタンは後続でAPI用意次第ON
          <button className="px-3 py-2 border rounded" onClick={buyPpv}>単品購入</button>
          */}
        </div>
      </div>
    );
  }

  if (q.isError) return <div className="p-6 text-red-600">読み込みに失敗しました</div>;
  const post = q.data!;
  return (
    <article className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <div className="prose whitespace-pre-wrap">{post.bodyMd ?? '（本文なし）'}</div>
    </article>
  );
}
