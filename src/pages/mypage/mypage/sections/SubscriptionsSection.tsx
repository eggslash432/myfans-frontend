// front/src/pages/mypage/mypage/sections/SubscriptionsSection.tsx

import { SubStatusBadge } from '@/components';
import type { MeSummary } from '@/shared';

export function SubscriptionsSection({
  summary,
}: {
  summary: MeSummary;
}) {
  const subs = summary.subscriptions ?? [];
  const subscriptionCount = subs.length;

  return (
    <section className="card">
      <div className="section-title flex items-center justify-between">
        <span>購読状況</span>
        <span className="text-xs text-gray-500">現在 {subscriptionCount} 件のプランを購読中</span>
      </div>

      {subscriptionCount === 0 ? (
        <p className="section-subtitle">まだ購読中のプランはありません。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {subs.map((sub) => (
            <li key={sub.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{sub.plan?.name}</div>
                <div className="text-xs text-gray-500">
                  {sub.creator?.publicName} / ¥{sub.plan?.priceJpy} / {sub.plan?.billingInterval}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  期間：
                  {new Date(sub.currentPeriodStart).toLocaleDateString()} 〜{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <SubStatusBadge status={sub.status} />
                {sub.cancelAtPeriodEnd && (
                  <span className="text-xs text-red-500">次回更新で解約</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
