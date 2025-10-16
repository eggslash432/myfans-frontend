import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { redirectToCheckoutSafe } from '../../lib/stripe';

export default function PostDetailPage() {
  const { id = '' } = useParams();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try { setData(await api.getPost(id)); } catch (e: any) { setErr(e.message || 'failed'); }
    })();
  }, [id]);

  const buyPPV = async () => {
    const origin = window.location.origin;
    const { sessionId } = await api.createPpvCheckout({
      postId: id,
      priceId: data?.ppvPriceId || 'seed-ppv-price-id',
      successUrl: `${origin}/checkout/success`,
      cancelUrl: `${origin}/checkout/cancel`,
    });
    await redirectToCheckoutSafe(sessionId);
  };

  if (err) return <div className="p-4 text-red-700">取得失敗: {err}</div>;
  if (!data) return <div className="p-4">読み込み中...</div>;

  const canView = !!data?.canView;
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <div className="opacity-75">公開範囲: {data.accessType /* 'plan' | 'ppv' | 'free' */}</div>

      {canView ? (
        <article className="prose">
          <p>{data.content ?? '（本文）'}</p>
        </article>
      ) : (
        <div className="p-4 border rounded bg-yellow-50">
          <p>この投稿は有料です。購読またはPPV購入が必要です。</p>
          {data.accessType === 'ppv' && (
            <button className="mt-2 px-3 py-2 bg-indigo-700 text-white rounded" onClick={buyPPV}>PPVを購入</button>
          )}
        </div>
      )}
    </div>
  );
}
