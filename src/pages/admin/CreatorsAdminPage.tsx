// front/src/pages/admin/CreatorsAdminPage.tsx

import { useEffect, useState } from 'react';
import { adminListPendingCreators, adminSetCreatorListing, ApiError } from '../../lib/api';

type PendingCreator = {
  userId: string;
  email: string;
  publicName: string | null;
  createdAt: string;
  stripeKycStatus?: string | null;
};

export default function CreatorsAdminPage() {
  const [list, setList] = useState<PendingCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await adminListPendingCreators();
      setList(data);
    } catch (e: any) {
      // ★ バックエンド未実装で 404 のときは「審査待ちなし」として扱う
      if (e instanceof ApiError && e.status === 404) {
        console.warn('/admin/creators?kycStatus=pending が未実装のため空リスト扱い', e);
        setList([]);
        setErr('');
      } else {
        console.error(e);
        setErr(e?.message ?? 'クリエイター一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApprove = async (userId: string) => {
    if (!confirm('このクリエイターを掲載許可にしますか？')) return;
    try {
      await adminSetCreatorListing(userId, true);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '更新に失敗しました');
    }
  };

  return (
    <div className="page max-w-md mx-auto">
      {/* タイトル */}
      <h1 className="page-title">クリエイター承認</h1>

      {/* サブ説明文（お好みで） */}
      <p className="page-description">
        クリエイターとして登録申請されたユーザーの一覧です。審査のうえ掲載を許可してください。
      </p>

      {/* ステータス表示 */}
      {loading && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          読み込み中...
        </div>
      )}

      {err && (
        <div className="mt-2 text-xs text-red-600 text-center">
          {err}
        </div>
      )}

      {!loading && !err && list.length === 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">
          現在、審査待ちのクリエイターはいません。
        </div>
      )}

      {/* 一覧カード */}
      {!loading && list.length > 0 && (
        <div className="mt-4 space-y-3">
          {list.map((c) => (
            <div
              key={c.userId}
              className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm flex justify-between items-center"
            >
              <div className="mr-2">
                <div className="text-sm font-semibold">
                  {c.publicName || '（表示名未設定）'}
                </div>
                <div className="text-[11px] text-gray-500">
                  {c.email}
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  申請日：
                  {new Date(c.createdAt).toLocaleString()}
                  <span className="ml-1">
                    / KYC: {c.stripeKycStatus ?? 'pending'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="flex-shrink-0 px-3 py-1 text-xs rounded-full bg-black text-white"
                onClick={() => handleApprove(c.userId)}
              >
                掲載を許可
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
