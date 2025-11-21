// myfans-frontend/src/pages/creators/settings.tsx
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type CreatorMe = {
  publicName: string;
  stripeKycStatus?: 'verified' | 'pending' | null;
};

export default function CreatorSettingsPage() {
  const [me, setMe] = useState<CreatorMe | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    api
      .getCreatorMe()
      .then((r) => setMe(r))
      .catch((e) => setErr(e?.message ?? '取得に失敗しました'));
  }, []);

  const handleStartKyc = async () => {
    setLoading(true);
    try {
      const { url } = await api.startCreatorKyc();
      window.location.href = url;
    } catch (e: any) {
      setErr(e?.message ?? 'KYC開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // エラー専用メッセージ（creator未登録対応）
  if (err === 'creator not found') {
    return (
      <div className="p-4 text-red-600">
        クリエイター登録がまだ行われていません。
        マイページからクリエイター登録を行ってください。
      </div>
    );
  }  
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!me) return <div>読み込み中...</div>;

  const kycStatus = me.stripeKycStatus ?? 'pending';

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">クリエイター設定</h1>

      <div>
        本人確認ステータス:{' '}
        {kycStatus === 'verified' ? (
          <span style={{ color: 'green' }}>承認済み</span>
        ) : (
          <span style={{ color: 'orange' }}>未完了</span>
        )}
      </div>

      {kycStatus !== 'verified' && (
        <button onClick={handleStartKyc} disabled={loading}>
          {loading ? '遷移中…' : '本人確認をはじめる'}
        </button>
      )}
    </div>
  );
}
