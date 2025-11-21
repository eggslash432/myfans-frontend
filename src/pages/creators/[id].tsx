// src/pages/creators/[id].tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function CreatorPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        // 詳細＆投稿を合わせて取得
        const detail = await api.getCreator(id);
        const postsRes = await api.getCreatorPosts(id);
        // バックエンドの形に合わせて正規化
        const rawPosts =
          Array.isArray(postsRes?.items) ? postsRes.items
          : Array.isArray(postsRes) ? postsRes
          : [];
        // ← ここで “無料推定” と “accessType” を正規化
        const posts = rawPosts.map((p: any) => {
          const visibility = p.visibility ?? (p.accessType === 'ppv' ? 'paid_single' : p.accessType === 'plan' ? 'plan' : 'free');
          const price = typeof p.price === 'number' ? p.price : (typeof p.priceJpy === 'number' ? p.priceJpy : null);
          const isFree = typeof p.isFree === 'boolean' ? p.isFree : (visibility === 'free' || price === 0);
          const accessType = visibility === 'paid_single' ? 'ppv' : (visibility === 'plan' ? 'plan' : 'free');
          return { ...p, visibility, price, isFree, accessType };
        }); 
        setData({
          creator: {
            id: detail.id,
            displayName: detail.displayName ?? detail.name ?? '',
            bio: detail.bio ?? '',
          },
          plans: detail.plans ?? [],
          posts,
        });
      } catch (e: any) {
        setErr(e.message || 'failed');
      }
    })();
  }, [id]);

  const buyPlan = async (planId: string, planName?: string) => {
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/checkout/success?plan=${encodeURIComponent(planName || '')}`;
      const cancelUrl = `${origin}/checkout/cancel`;

      const { url } = await api.createPlanCheckout({ creatorId: id, planId, successUrl, cancelUrl });
      window.location.href = url;
    } catch (e: any) {
      setErr(e?.message ?? 'Checkoutの起動に失敗しました');
    }
  };

  if (err) return <div className="p-6 text-red-700">取得失敗: {err}</div>;
  if (!data) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="p-6 space-y-4">
      <button onClick={() => nav(-1)} className="text-sm underline">
        ← 戻る
      </button>
      <h1 className="text-2xl font-bold">
        {data.creator?.displayName || data.creator?.name}
      </h1>
      {data.creator?.bio && <p className="opacity-70">{data.creator.bio}</p>}

      <section>
        <h2 className="font-semibold mb-2">プラン</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {(data.plans || []).map((p: any) => (
            <div
              key={p.id}
              className="border rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm opacity-70">¥{p.price} / 月</div>
              </div>
              <button
                className="px-3 py-2 bg-indigo-700 text-white rounded"
                onClick={() => buyPlan(p.id, p.title)}
              >
                購読する
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">投稿</h2>
        <ul className="list-disc pl-5 space-y-1">
          {(data.posts || []).map((post: any) => (
            <li key={post.id}>
              <Link className="underline" to={`/posts/${post.id}`}>
                {post.title}
              </Link>
              {/* 無料はバッジ/購入導線を出さない */}
              {!post.isFree && post.accessType === 'ppv' && (                
                <span className="ml-2 text-xs px-2 py-0.5 border rounded">
                  PPV
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
