// front/src/pages/mypage/mypage/sections/PaymentsSection.tsx
import React from 'react';
import type { MeSummary } from '../../../../shared/types';

export function PaymentsSection({ summary }: { summary: MeSummary }) {
  const payments = summary.payments ?? [];
  const paymentCount = payments.length;

  return (
    <section className="card mb-4">
      <div className="section-title flex items-center justify-between">
        <span>支払い履歴</span>
        <span className="text-xs text-gray-500">合計 {paymentCount} 件</span>
      </div>

      {paymentCount === 0 ? (
        <p className="section-subtitle">まだ決済履歴がありません。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {payments.map((p) => (
            <li key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold text-sm">¥{p.amountJpy.toLocaleString()}</div>
                <div className="text-xs text-gray-500">
                  {p.kind === 'subscription'
                    ? `プラン：${p.plan?.name}`
                    : `単品購入：${p.post?.title}`}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(p.paidAt ?? p.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="text-xs text-gray-500">{p.creator?.publicName}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
