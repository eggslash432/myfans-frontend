// front/src/pages/admin/Dashboard.tsx

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../components/ProtectedRoute';
import { api } from '../../lib/api';

type AdminSummary = {
  salesMonthly: number;
  newUsersMonthly: number;
  reportsPending: number;
};

function AdminInner() {
  const { data, isLoading, error } = useQuery<AdminSummary>({
    queryKey: ['admin_summary'],
    queryFn: async () => (await api.get<AdminSummary>('/admin/summary')).data,
    // サマリAPIが404でも他のUIは出したいので、エラーは握りつぶさないが画面全体は止めない
  });

  const summary = data ?? {
    salesMonthly: 0,
    newUsersMonthly: 0,
    reportsPending: 0,
  };

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto">
      {/* タイトル */}
      <div>
        <h1 className="text-lg font-bold mb-1">管理ダッシュボード</h1>
        <p className="text-xs text-gray-500">
          クリエイター・投稿・出金申請・通報の管理を行います。
        </p>
      </div>

      {/* 管理ページへのリンクカード */}
      <div className="space-y-3">
        <Link to="/admin/creators" className="block border rounded p-3 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">クリエイター管理</div>
              <div className="text-xs text-gray-500">
                クリエイターの一覧・公開可否・KYC状況の確認
              </div>
            </div>
            <span>›</span>
          </div>
        </Link>

        <Link to="/admin/posts" className="block border rounded p-3 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">投稿管理</div>
              <div className="text-xs text-gray-500">
                投稿一覧・公開ステータス変更・削除・通報内容の確認
              </div>
            </div>
            <span>›</span>
          </div>
        </Link>

        <Link to="/admin/payouts" className="block border rounded p-3 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">出金管理</div>
              <div className="text-xs text-gray-500">
                クリエイターからの出金申請の承認／却下
              </div>
            </div>
            <span>›</span>
          </div>
        </Link>

        <Link to="/admin/reports" className="block border rounded p-3 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold mb-1">通報一覧</div>
              <div className="text-xs text-gray-500">
                ユーザーからの通報の確認と対応ステータス変更
              </div>
            </div>
            <span>›</span>
          </div>
        </Link>
      </div>

      {/* サマリ（APIエラーでもページ全体は表示したい） */}
      <div>
        <h2 className="text-sm font-semibold mb-2">サマリー</h2>

        {isLoading && <div className="text-xs text-gray-500">読み込み中...</div>}

        {error && (
          <div className="text-xs text-red-600 mb-2">
            管理サマリを取得できませんでした。
            <br />
            バックエンド側の <code>/admin/summary</code> API が未実装、
            または権限不足の可能性があります。
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">月間売上</div>
            <div className="text-xl">¥{summary.salesMonthly}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">新規登録</div>
            <div className="text-xl">{summary.newUsersMonthly}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-xs text-gray-500">通報(未対応)</div>
            <div className="text-xl">{summary.reportsPending}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminInner />
    </ProtectedRoute>
  );
}
