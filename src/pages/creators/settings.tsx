// front/src/pages/creators/settings.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import type { CreatorMeResponse } from '../../shared/types';

export default function CreatorSettingsPage() {
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const navigate = useNavigate();

  // クリエイター情報取得
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creators/me');
        setCreator(res.data);
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? '取得に失敗しました';
        setErr(msg);
      }
    })();
  }, []);

  // ★ 本人確認開始：Stripe Connect へ飛ばす
  const handleStartKyc = async () => {
    setLoading(true);
    setErr('');
    try {
      const { url } = await api.startCreatorKyc();  // POST /creators/me/kyc/start
      // 戻ってこない前提なので location.href で遷移
      window.location.href = url;
    } catch (e: any) {
      // fetch ラッパ（ApiError）対応
      const msg =
        e?.body?.message ??
        e?.message ??
        'KYC開始に失敗しました';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // ① クリエイター未登録時
  if (err === 'creator not found') {
    return (
      <div className="p-4 text-red-600">
        クリエイター登録がまだ行われていません。
        マイページからクリエイター登録を行ってください。
      </div>
    );
  }

  // ② その他エラー
  if (err && !creator) {
    return <div className="p-4 text-red-600">{err}</div>;
  }

  // ③ ローディング
  if (!creator) {
    return <div className="p-4">読み込み中...</div>;
  }

  // ④ KYC ステータス
  const kyc = creator.kyc || {};
  const kycStatus = kyc.status ?? creator.stripeKycStatus ?? 'pending';
  const isKycOk = kycStatus === 'approved';

  return (
    <div className="p-6 space-y-5 page">
      <h1 className="page-title">クリエイター設定</h1>

      <section className="card space-y-3">
        <div className="section-title">本人確認ステータス</div>

        <div className="text-sm">
          {kycStatus === 'approved' ? (
            <span className="font-semibold text-green-600">承認済み</span>
          ) : (
            <span className="font-semibold text-orange-500">未完了</span>
          )}
        </div>

        {/* Stripe 側のエラー */}
        {kyc.disabledReason && (
          <div className="p-3 border border-red-300 bg-red-50 text-red-700 rounded-lg text-sm">
            Stripe 側のエラー / 制限：{kyc.disabledReason}
          </div>
        )}

        {/* KYC 未完了時のみ表示 */}
        {kycStatus !== 'approved' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              本人確認を完了すると、投稿・プラン作成・出金が利用できるようになります。
            </p>

            <button
              onClick={handleStartKyc}
              disabled={loading || isKycOk}
              className="btn btn-primary w-full"
            >
              {loading ? '遷移中…' : '本人確認をはじめる'}
            </button>
          </div>
        )}

        {/* プロフィール更新 */}
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
