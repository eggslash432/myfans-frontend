import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { apiGet } from '../../lib/http';
import PurchaseButton from '../../components/PurchaseButton';

type PostDetail = {
  id: string;
  title: string;
  contentHtml?: string | null;
  isFree: boolean;
  price?: number | null;
  isAccessible?: boolean;
  mediaUrls?: string[];
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet<PostDetail>(`/posts/${id}`);
        setPost(data);
        setForbidden(false);
      } catch (e: any) {
        console.error('投稿取得エラー', e);
        if (typeof e?.message === 'string' && e.message.includes('購読が必要')) {
          setForbidden(true);
        } else {
          setForbidden(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <main className="max-w-3xl mx-auto p-4">読み込み中…</main>;

  if (forbidden && !post) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">この投稿は有料です</h1>
        <PurchaseButton postId={String(id)} priceYen={0} className="bg-indigo-600 text-white" />
        <p className="text-sm text-gray-500 mt-3">購入完了後、このページに戻ると閲覧できます。</p>
      </main>
    );
  }

  if (!post) {
    return <main className="max-w-3xl mx-auto p-4">投稿が見つかりませんでした。</main>;
  }

  const canOpen = post.isFree || post.isAccessible;

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {!canOpen && (
        <div className="mt-6 rounded-xl border p-4">
          <p className="mb-3">この投稿は有料です。購入後に閲覧できます。</p>
          <PurchaseButton postId={post.id} priceYen={post.price || 0} className="bg-indigo-600 text-white" />
        </div>
      )}

      {canOpen && (
        <article className="prose max-w-none mt-6">
          {post.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          ) : (
            <p>本文がありません。</p>
          )}
          {post.mediaUrls?.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {post.mediaUrls.map((u) => (
                <video key={u} src={u} controls className="w-full rounded-xl" />
              ))}
            </div>
          ) : null}
        </article>
      )}
    </main>
  );
}
