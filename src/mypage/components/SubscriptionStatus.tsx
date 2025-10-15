import type { Me } from '../types';

export default function SubscriptionStatus({ me }: { me: Me }) {
  const s = me.subscription;
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">購読状況</h2>
      {s ? (
        <div className="text-sm">
          <div>プラン: {s.planName}</div>
          {s.nextBillingDate && <div>次回更新: {new Date(s.nextBillingDate).toLocaleString()}</div>}
          <div>状態: {s.status ?? '—'}</div>
        </div>
      ) : (
        <div>未購読</div>
      )}
    </div>
  );
}
