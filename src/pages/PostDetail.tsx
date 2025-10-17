// src/pages/posts/PostDetail.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type ApiError } from '../lib/api';

type Post = {
  id: string;
  title: string;
  body?: string;
  bodyMd?: string;
  visibility: 'free' | 'plan' | 'paid_single';
  creatorId: string;
  planId?: string | null;
};

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();

  const q = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPost(id as string), // ← 直接Postを返す
    retry: (count, err: any) => {
      const status = (err as ApiError)?.status;
      // 403/404/400系はリトライ不要
      if (status && status >= 400 && status < 500) return false;
      return count < 1;
    },
    staleTime: 60_000,
    enabled: !!id,
  });

  if (q.isLoading) {
    return <div className="p-6 text-center text-gray-500">読み込み中…</div>;
  }

  if (q.isError) {
    const status = (q.error as ApiError)?.status;
    if (status === 403) {
      // 購読/PPVが必要
      return (
        <div className="max-w-lg mx-auto p-6 text-center space-y-3">
          <div className="text-xl font-semibold">この投稿は有料です</div>
          <div className="text-sm text-gray-600">ログインして購読プラン加入/PPV購入が必要です</div>
        </div>
      );
    }
    if (status === 404) {
      return <div className="p-6 text-center text-gray-500">投稿が見つかりませんでした</div>;
    }
    return (
      <div className="p-6 text-center text-red-600">
        取得に失敗しました：{(q.error as ApiError)?.message ?? 'unknown error'}
      </div>
    );
  }

  const post = q.data as Post;
  const body = post.body ?? post.bodyMd ?? '';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <div className="text-sm text-gray-500">
        可視性: {post.visibility === 'free' ? '無料' : post.visibility === 'plan' ? '購読者限定' : 'PPV'}
      </div>
      <article className="prose max-w-none whitespace-pre-wrap">{body}</article>
    </div>
  );
}
