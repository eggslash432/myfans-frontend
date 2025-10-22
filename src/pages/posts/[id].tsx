import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';

export default function PostDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try { setData(await api.getPost(id)); } catch (e: any) { setErr(e.message || 'failed'); }
    })();
  }, [id]);

  // const buyPPV = async () => {
  //   const origin = window.location.origin;
  //   const { sessionId } = await api.createPpvCheckout({
  //     postId: id,
  //     priceId: data?.ppvPriceId || 'seed-ppv-price-id',
  //     successUrl: `${origin}/checkout/success`,
  //     cancelUrl: `${origin}/checkout/cancel`,
  //   });
  //   await redirectToCheckoutSafe(sessionId);
  // };

  if (err) return <div className="p-4 text-red-700">取得失敗: {err}</div>;
  if (!data) return <div className="p-4">読み込み中...</div>;

  const accessType =
    data?.accessType ??
    (data?.visibility === 'paid_single' ? 'ppv'
     : data?.visibility === 'plan' ? 'plan'
     : 'free');
  const canView =
    data?.visibility === 'free'        // ← 無料は常に閲覧可
      ? true
      : !!data?.canView;               // それ以外はサーバの判定に従う

  // PPV（単発）購入
  const buyPPV = async () => {
    try {
      const res = await api.checkoutPpvPost(id);
      if (res?.url) {
        window.location.assign(res.url);
      } else if (res?.sessionId) {
        window.location.href = res?.url? res.url : '/';
      } else {
        alert('購入セッションの作成に失敗しました。');
      }
    } catch (e: any) {
      alert(e?.message || '購入処理に失敗しました。');
    }
  };

  // プラン購読（プラン選択へ誘導。プランIDが把握できる場合は createPlanCheckout を直接叩いてもOK）
  const goSubscribe = () => {
    if (data?.creatorId) {
      nav(`/creators/${data.creatorId}`); // クリエイター詳細→プランへ誘導
    } else {
      nav(`/`); // フォールバック
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <div className="opacity-75">公開範囲: {accessType /* 'plan' | 'ppv' | 'free' */}</div>

      {canView ? (
        <article className="prose">
          <p>{(data.content ?? data.body ?? data.bodyMd ?? '').trim() || '（本文）'}</p>
        </article>
      ) : (
        <div className="p-4 border rounded bg-yellow-50">
          <p>この投稿は有料です。購読またはPPV購入が必要です。</p>
          {accessType === 'ppv' && (
            <button
              className="mt-2 px-3 py-2 bg-indigo-700 text-white rounded"
              onClick={buyPPV}
            >
              PPVを購入
            </button>
          )}
          {accessType === 'plan' && (
            <button
              className="mt-2 px-3 py-2 border rounded"
              onClick={goSubscribe}
            >
              プランを購読する
            </button>
          )} 
        </div>
      )}
    </div>
  );
}
