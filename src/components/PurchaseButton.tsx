// src/components/PurchaseButton.tsx
import { useState } from 'react';
import { createCheckoutSession } from '../lib/payments';

type Props = {
  postId?: string;
  priceYen?: number | null;   // ← 任意に変更
  disabled?: boolean;
  className?: string;
};
export default function PurchaseButton({ postId, priceYen, disabled, className }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const url = await createCheckoutSession({ postId });
      window.location.href = url;
    } catch (e: any) {
      alert(e?.message || '決済開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? '処理中…'
    : priceYen && priceYen > 0
      ? `¥${priceYen.toLocaleString()}で購入`
      : '購入する'; // ← 価格が未取得でも出す

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-2xl shadow ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || 'bg-black text-white'}`}
      aria-label="この投稿を購入して閲覧する"
    >
      {label}
    </button>
  );
}
