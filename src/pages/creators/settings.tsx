// front/src/pages/creators/settings.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { CreatorMeResponse } from '../../shared/types';

export default function CreatorSettingsPage() {
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  // クリエイター情報取得
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creators/me');
        setCreator(res.data);
      } catch (e: any) {
        // バックエンド側で "creator not found" を投げている想定
        const msg = e?.response?.data?.message ?? e?.message ?? '取得に失敗しました';
        setErr(msg);
      }
    })();
  }, []);

  const handleStartKyc = async () => {
    setLoading(true);
    try {
      const { url } = await api.startCreatorKyc();
      window.location.href = url;
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? 'KYC開始に失敗しました';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // ① クリエイター未登録の場合（特別メッセージ）
  if (err === 'creator not found') {
    return (
      <div className="p-4 text-red-600">
        クリエイター登録がまだ行われていません。
        マイページからクリエイター登録を行ってください。
      </div>
    );
  }

  // ② その他のエラー
  if (err && !creator) {
    return <div className="p-4 text-red-600">{err}</div>;
  }

  // ③ ローディング
  if (!creator) {
    return <div>読み込み中...</div>;
  }

  // ④ KYC 情報の判定
  const kyc = creator.kyc || {};
  const kycStatus =
    kyc.status ?? creator.stripeKycStatus ?? 'pending';

  const isKycOk = kycStatus === 'approved';

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">クリエイター設定</h1>

      {/* KYC ステータス表示 */}
      <div>
        本人確認ステータス:{' '}
        {kycStatus === 'approved' ? (
          <span style={{ color: 'green' }}>承認済み</span>
        ) : (
          <span style={{ color: 'orange' }}>未完了</span>
        )}
      </div>

      {/* Stripe 側エラー表示（あれば） */}
      {kyc.disabledReason && (
        <div className="p-3 border border-red-400 text-red-700">
          Stripe 側のエラー / 制限: {kyc.disabledReason}
        </div>
      )}

      {/* KYC 未完了なら案内＋開始ボタン */}
      {kycStatus !== 'approved' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            本人確認を完了すると、投稿・プラン作成・出金が利用できるようになります。
          </p>
          <button
            onClick={handleStartKyc}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? '遷移中…' : '本人確認をはじめる'}
          </button>
        </div>
      )}

      {/* ここから先のフォームやボタンは isKycOk のときだけ表示 or 有効化 */}
      <div className="mt-6">
        <button
          disabled={!isKycOk}
          className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
        >
          プロフィールを更新（ダミー）
        </button>
      </div>
    </div>
  );
}
