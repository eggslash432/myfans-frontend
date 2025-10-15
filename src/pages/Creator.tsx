import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';
import { useParams } from 'react-router-dom';
 
type Plan = {
  id: string;
  name: string;
  priceJpy?: number;
  price?: number; // BEがpriceで返す場合も考慮
  interval?: 'month';
};
 
type Creator = {
  id: string;
  displayName: string;
  bio?: string;
  plans: Plan[];
};
 
export default function CreatorPage() {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/creators/${id}`);
        setCreator(data);
      } catch (e: any) {
        setError(e.message ?? 'load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSubscribe(planId: string) {
    if (!id) return;
    try {
      // BE: POST /creators/:creatorId/plans/:planId/checkout → { url }
      const { url } = await apiPost(`/creators/${id}/plans/${planId}/checkout`);
      if (!url) throw new Error('Checkout URL not returned');
      window.location.href = url; // 直接リダイレクト
    } catch (e: any) {
      alert(e?.message ?? 'Checkoutの作成に失敗しました');
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!creator) return <div className="p-6">Not found</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{creator.displayName}</h1>
        {creator.bio && <p className="text-slate-600 mt-2">{creator.bio}</p>}
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">プラン</h2>
        {/* これまでのダミー配列は削除。BEのplansをそのまま表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creator.plans?.map((p) => (
            <div key={p.id} className="rounded-xl border p-4 shadow-sm">
              <div className="font-semibold">{p.name}</div>
              <div className="text-2xl mt-1">¥{(p.priceJpy ?? p.price ?? 0).toLocaleString()}/月</div>
              <button
                className="mt-4 w-full rounded-lg border px-4 py-2 hover:bg-slate-50"
                onClick={() => onSubscribe(p.id)}
              >
                購読する
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TODO: 投稿一覧（必要に応じて実装） */}
    </div>
  );
}