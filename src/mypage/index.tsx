'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from './api';
import { useMe } from './hooks/useMe';
import SubscriptionStatus from './components/SubscriptionStatus';
import PlanList from './components/PlanList';
import PaymentHistory from './components/PaymentHistory';

export default function MyPageContainer() {
  const { me, loading, err } = useMe();
  const [busy, setBusy] = useState(false);

  async function handleSubscribe(planId: string) {
    try {
      setBusy(true);
      const { sessionId, pubKey } = await createCheckoutSession(planId);
      const stripe = await loadStripe(pubKey);
      if (!stripe) throw new Error('Stripe init failed');
      // cast to any to satisfy TypeScript definitions for redirectToCheckout
      await (stripe as any).redirectToCheckout({ sessionId });
    } catch (e:any) {
      console.error(e);
      alert(e.message ?? '決済に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6">読み込み中…</div>;
  if (err) return <div className="p-6 text-red-600">エラー: {err}</div>;
  if (!me) {
    return (
      <div className="p-6">
        <p>ログインが必要です。</p>
        <a href="/login" className="underline">ログインへ</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="border rounded p-4">
        こんにちは、{me.nickname ?? me.email} さん
      </div>
      <SubscriptionStatus me={me} />
      <PlanList onSubscribe={handleSubscribe} loading={busy} />
      <PaymentHistory userId={me.id} />
    </div>
  );
}
