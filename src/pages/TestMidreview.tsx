import { useState } from 'react';
import { api } from '../lib/api';
import { getStripe } from '../lib/stripe';

export default function TestMidreview() {
  const [log, setLog] = useState<string>('準備OK');

  const run = async (name: string, fn: () => Promise<any>) => {
    setLog((v) => v + `\n▶ ${name}`);
    try {
      const res = await fn();
      setLog((v) => v + `\n✅ ${name}: ` + JSON.stringify(res, null, 2));
    } catch (e: any) {
      setLog((v) => v + `\n🛑 ${name}: ${e.status||''} ${e.message||e.toString()}`);
    }
  };

  const origin = window.location.origin;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">中間検収テスト</h1>

      {/* 認証 */}
      <div className="space-x-2">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={() =>
          run('サインアップ(fan)', () => api.signup({email:'user1@example.com',password:'pass1234',role:'fan'}))
        }>サインアップ(fan)</button>

        <button className="px-3 py-2 bg-black text-white rounded" onClick={() =>
          run('ログイン(fan)', () => api.login({email:'user1@example.com',password:'pass1234'}))
        }>ログイン</button>

        <button className="px-3 py-2 bg-slate-700 text-white rounded" onClick={() => run('Me', api.me)}>
          /users/me
        </button>

        <button className="px-3 py-2 bg-slate-700 text-white rounded" onClick={() => run('Me Summary', api.meSummary)}>
          /users/me/summary
        </button>
      </div>

      {/* クリエイター/投稿 */}
      <div className="space-x-2">
        <button className="px-3 py-2 bg-emerald-700 text-white rounded" onClick={() => run('クリエイター一覧', () => api.listCreators())}>
          /creators
        </button>

        <button className="px-3 py-2 bg-emerald-700 text-white rounded" onClick={() => run('クリエイター詳細(id=seed)', () => api.getCreator('seed-creator-id'))}>
          /creators/:id
        </button>

        <button className="px-3 py-2 bg-emerald-700 text-white rounded" onClick={() => run('投稿詳細(id=seed)', () => api.getPost('seed-post-id'))}>
          /posts/:id
        </button>
      </div>

      {/* 決済（Stripe Checkoutへ遷移） */}
      <div className="space-x-2">
        <button className="px-3 py-2 bg-indigo-700 text-white rounded" onClick={() => run('Plan Checkout', async () => {
          const payload = { creatorId: 'seed-creator-id', planId: 'seed-plan-id', successUrl: `${origin}/mypage`, cancelUrl: `${origin}/creators/seed-creator-id` };
          const { sessionId } = await api.createPlanCheckout(payload);
          const stripe = await getStripe();
          if (stripe) {
            await (stripe as any).redirectToCheckout({ sessionId });
          }
          return { sessionId };
        })}>
          プラン決済
        <button className="px-3 py-2 bg-indigo-700 text-white rounded" onClick={() => run('PPV Checkout', async () => {
          const payload = { postId: 'seed-post-id', priceId: 'seed-ppv-price-id', successUrl: `${origin}/posts/seed-post-id`, cancelUrl: `${origin}/posts/seed-post-id` };
          const { sessionId } = await api.createPpvCheckout(payload);
          const stripe = await getStripe();
          if (stripe) {
            await (stripe as any).redirectToCheckout({ sessionId });
          }
          return { sessionId };
        })}>
          PPV決済
        </button>
          PPV決済
        </button>

        <button className="px-3 py-2 bg-purple-700 text-white rounded" onClick={() => run('購読一覧', api.mySubscriptions)}>
          /subscriptions/my
        </button>

        <button className="px-3 py-2 bg-purple-700 text-white rounded" onClick={() => run('支払履歴', api.myPayments)}>
          /payments/history
        </button>
      </div>

      <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded max-h-[60vh] overflow-auto">{log}</pre>
    </div>
  );
}
