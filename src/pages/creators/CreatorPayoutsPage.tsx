// front/src/pages/creator/CreatorPayoutsPage.tsx

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Payout } from '../../shared/types';
import type { PayoutStatus } from '../../shared/prisma-enums';

export default function PayoutsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [items, setItems] = useState<Payout[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState<string>('');
  const [creator, setCreator] = useState<any | null>(null);
  const [creatorErr, setCreatorErr] = useState('');

  // 出金情報読み込み
  async function loadAll() {
    try {
      setLoadingAll(true);
      setError('');

      // 残高
      const balRes = await api.get<{ balanceJpy: number }>(
        '/creators/me/payouts/balance',
      );
      setBalance(balRes.data.balanceJpy);

      // 出金履歴
      const listRes = await api.get<Payout[]>('/creators/me/payouts');
      setItems(listRes.data ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? '読み込みに失敗しました');
    } finally {
      setLoadingAll(false);
    }
  }

  // クリエイター情報 + 出金情報
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creators/me');
        setCreator(res.data);
        setCreatorErr('');

        // KYC / Stripe OK のときだけ出金情報を取りに行く
        const kyc = res.data?.kyc ?? {};
        const kycStatus = kyc.status ?? res.data?.stripeKycStatus ?? 'pending';
        const payoutsEnabled =
          res.data?.stripePayoutsEnabled ?? kyc.payoutsEnabled ?? false;
        const isKycOk = kycStatus === 'approved' && payoutsEnabled;

        if (isKycOk) {
          await loadAll();
        } else {
          setLoadingAll(false);
        }
      } catch (e: any) {
        console.error(e);
        setCreatorErr(
          e?.response?.data?.message ??
            e?.message ??
            'クリエイター情報の取得に失敗しました',
        );
        setLoadingAll(false);
      }
    })();
  }, []);

  async function handleRequest() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert('正しい金額を入力してください');
      return;
    }
    setLoading(true);
    try {
      await api.post('/creators/me/payouts/request', { amountJpy: num });
      alert('出金リクエストを送信しました');
      setAmount('');
      await loadAll();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        '出金リクエストに失敗しました';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  function renderStatusLabel(s: PayoutStatus) {
    switch (s) {
      case 'requested':
        return '申請中';
      case 'approved':
        return '承認済（振込待ち）';
      case 'paid':
        return '振込済み';
      case 'rejected':
        return '却下';
      default:
        return s;
    }
  }

  // クリエイター未登録
  if (creatorErr === 'creator not found') {
    return (
      <div className="page">
        <h1 className="page-title">出金管理</h1>
        <section className="card">
          <p className="text-sm text-gray-700">
            出金機能を利用するには、まずクリエイター登録が必要です。
          </p>
        </section>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="page">
        <div className="p-4 text-sm text-gray-500">読み込み中…</div>
      </div>
    );
  }

  // KYC / Stripe ステータス判定（NewPost と揃える）
  const kyc = creator.kyc ?? {};
  const kycStatus = kyc.status ?? creator.stripeKycStatus ?? 'pending';
  const payoutsEnabled =
    creator.stripePayoutsEnabled ?? kyc.payoutsEnabled ?? false;
  const isKycOk = kycStatus === 'approved' && payoutsEnabled;

  // KYC 未完了 or 出金無効のとき
  if (!isKycOk) {
    return (
      <div className="page space-y-4">
        <h1 className="page-title">出金管理</h1>
        <section className="card space-y-2">
          <p className="text-sm text-gray-700">
            本人確認（KYC）と Stripe 側の審査が完了していないため、
            出金機能は現在ご利用いただけません。
          </p>
          <p className="text-xs text-gray-500">
            現在のステータス: KYC = {kycStatus},{' '}
            StripePayoutsEnabled = {String(payoutsEnabled)}
          </p>
          {kyc.disabledReason && (
            <p className="text-xs text-red-600">
              Stripe エラー: {kyc.disabledReason}
            </p>
          )}
        </section>
      </div>
    );
  }

  // ここから出金機能本体
  return (
    <div className="page space-y-4">
      <h1 className="page-title">出金管理</h1>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* 残高表示 */}
      <section className="card space-y-2">
        <div className="text-sm text-gray-600">出金可能残高</div>
        <div className="text-2xl font-semibold">
          {balance == null ? '読み込み中…' : `¥${balance.toLocaleString()}`}
        </div>
      </section>

      {/* 出金リクエストフォーム */}
      <section className="card space-y-3">
        <div className="section-title">出金リクエスト</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            className="form-input w-40"
            placeholder="金額（円）"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleRequest}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? '送信中…' : '出金申請する'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          出金可能残高の範囲内で申請できます。
        </p>
      </section>

      {/* リスト */}
      <section className="card space-y-3">
        <div className="section-title">出金履歴</div>
        {loadingAll ? (
          <div className="text-sm text-gray-500">読み込み中…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">
            まだ出金リクエストはありません。
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">申請日</th>
                <th className="text-right py-1">金額</th>
                <th className="text-left py-1">ステータス</th>
                <th className="text-left py-1">振込日</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1">
                    {new Date(p.requestedAt).toLocaleString()}
                  </td>
                  <td className="py-1 text-right">
                    ¥{p.amountJpy.toLocaleString()}
                  </td>
                  <td className="py-1">
                    {renderStatusLabel(p.payoutStatus)}
                  </td>
                  <td className="py-1">
                    {p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
