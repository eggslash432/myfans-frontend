// front/src/pages/creators/settings.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCreatorMe, startCreatorKyc } from '../../lib/api';
import type { CreatorMeResponse } from '../../shared/types';

type KycStatusFront = 'approved' | 'pending' | 'rejected';

export default function CreatorSettingsPage() {
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getCreatorMe();
        setCreator(data);
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? '取得に失敗しました';
        setErr(msg);
      }
    })();
  }, []);

  const handleStartKyc = async () => {
    setLoading(true);
    setErr('');
    try {
      const { url } = await startCreatorKyc();
      window.location.href = url;
    } catch (e: any) {
      const msg = e?.body?.message ?? e?.message ?? 'KYC開始に失敗しました';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  if (err === 'creator not found') {
    return (
      <div className="p-4 text-red-600">
        クリエイター登録がまだ行われていません。
        マイページからクリエイター登録を行ってください。
      </div>
    );
  }

  if (err && !creator) return <div className="p-4 text-red-600">{err}</div>;
  if (!creator) return <div className="p-4">読み込み中...</div>;

  // ✅ 「開始済み」判定は stripeAccountId を最優先
  const hasStartedKyc = !!(creator as any).stripeAccountId;

  // DB上の enum: 'pending' | 'approved' | 'rejected' | null
  const rawStatus = creator.stripeKycStatus as KycStatusFront | null | undefined;

  // ✅ 未開始なら status は null 扱いで固定（pending にしない！）
  const kycStatus: KycStatusFront | null = hasStartedKyc ? (rawStatus ?? 'pending') : null;

  const isKycOk = kycStatus === 'approved';
  const disabledReason = creator.stripeKycDisabledReason ?? null;

  return (
    <div className="p-6 space-y-5 page">
      <h1 className="page-title">クリエイター設定</h1>

      <section className="card space-y-3">
        <div className="section-title">本人確認ステータス</div>

        <div className="text-sm">
          {kycStatus === null && (
            <span className="font-semibold text-gray-600">未開始</span>
          )}

          {kycStatus === 'approved' && (
            <span className="font-semibold text-green-600">承認済み</span>
          )}

          {kycStatus === 'pending' && (
            <span className="font-semibold text-orange-500">審査中（Stripeでの確認待ち）</span>
          )}

          {kycStatus === 'rejected' && (
            <span className="font-semibold text-red-600">差し戻し（本人確認のやり直しが必要です）</span>
          )}
        </div>

        {disabledReason && (
          <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded-lg text-sm">
            Stripe 側のエラー / 制限：{disabledReason}
          </div>
        )}

        {/* ✅ 未開始 */}
        {kycStatus === null && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              本人確認を開始すると、投稿・プラン作成・出金が利用できるようになります。
            </p>
            <button
              onClick={handleStartKyc}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '遷移中…' : '本人確認をはじめる'}
            </button>
          </div>
        )}

        {/* ✅ 審査中 */}
        {kycStatus === 'pending' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Stripe 上での本人確認は提出済みで、現在審査中です。
              審査が完了すると自動的に状態が更新されます。
            </p>
            {/* 任意：やり直したい場合の導線 */}
            <button
              onClick={handleStartKyc}
              disabled={loading}
              className="btn btn-outline w-full"
            >
              {loading ? '遷移中…' : '本人確認を開く'}
            </button>
          </div>
        )}

        {/* ✅ 差し戻し */}
        {kycStatus === 'rejected' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              本人確認が差し戻されました。内容を修正して再提出してください。
            </p>
            <button
              onClick={handleStartKyc}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '遷移中…' : '本人確認をやり直す'}
            </button>
          </div>
        )}

        <div className="pt-3">
          <button
            disabled={!isKycOk}
            onClick={() => navigate('/creator/profile')}
            className="btn btn-outline w-full disabled:opacity-50"
          >
            プロフィールを更新
          </button>
        </div>
      </section>
    </div>
  );
}
