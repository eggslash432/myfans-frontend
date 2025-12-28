// front/src/pages/plans/Plans.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { 
  getCreatorPublicProfile,
  createCheckoutSession, 
} from '@/lib/api';
import type { 
  Creator, 
  Plan 
} from '@/shared';
import { 
  planInterval, 
  planPriceYen, 
} from '@/shared';

export function Plans() {
  const { id } = useParams();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<Creator>({
    queryKey: ['creator-detail-for-plans', id],
    enabled: !!id,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      if (!id) throw new Error('creator id is missing');
      return await getCreatorPublicProfile(id);
    },
  });

  async function subscribe(planId: string) {
    if (!id) return;

    try {
      setBusy(planId);

      const successUrl = `${window.location.origin}/creators/${id}?subscribed=1`;
      const cancelUrl = `${window.location.origin}/creators/${id}`;

      // ✅ createCheckoutSession は「url文字列」を返す + 引数必須
      const { url } = await createCheckoutSession({
        planId,
        successUrl,
        cancelUrl,
      });

      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? e?.body?.message ?? 'プラン加入の開始に失敗しました');
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <div className="p-6">読み込み中…</div>;
  if (error) return <div className="p-6 text-red-600">エラー：{(error as any)?.message}</div>;
  if (!data) return null;

  const title =
    (data as any).displayName ??
    (data as any).publicName ??
    (data as any).name ??
    'クリエイター';

  const plans = ((data as any).plans ?? []) as Plan[];

  return (
    <main className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{title} のプラン</h1>

      {plans.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const price = planPriceYen(p);
            const interval = planInterval(p);

            return (
              <div key={(p as any).id} className="border rounded p-4">
                <div className="font-semibold">{(p as any).name ?? '購読プラン'}</div>

                <div className="text-2xl font-bold mt-2">
                  ¥{price.toLocaleString()} <span className="text-sm">/{interval}</span>
                </div>

                <button
                  className="mt-4 w-full px-4 py-2 rounded bg-black text-white disabled:opacity-60"
                  onClick={() => subscribe((p as any).id)}
                  disabled={!!busy}
                >
                  {busy === (p as any).id ? '処理中…' : 'このプランに加入する'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div>公開されているプランがありません。</div>
      )}
    </main>
  );
}
