// front/src/pages/admin/AdminDashboard.tsx

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { AdminSummary } from '@/shared';
import { adminGetSummary } from '@/features/admin';

function AdminInner() {
  const { data, isLoading, error } = useQuery<AdminSummary>({
    queryKey: ['admin_summary'],
    queryFn: adminGetSummary,
  });

  const summary = data ?? {
    salesMonthly: 0,
    newUsersMonthly: 0,
    reportsPending: 0,
  };

  return (
    <div className="page space-y-4 max-w-lg mx-auto">
      {/* タイトル */}
      <section className="text-center">
        <h1 className="page-title">管理ダッシュボード</h1>
        <p className="page-description">
          クリエイター・投稿・出金申請・通報の管理を行います。
        </p>
      </section>

      {/* 管理メニュー */}
      <section className="space-y-3">
        <Link to="/admin/creators" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">クリエイター管理</div>
              <div className="text-xs text-gray-500 mt-1">
                一覧・公開可否・KYC 状況の確認
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/posts" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">投稿管理</div>
              <div className="text-xs text-gray-500 mt-1">
                ステータス変更・削除・通報内容の確認
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/payouts" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">出金管理</div>
              <div className="text-xs text-gray-500 mt-1">
                出金申請の承認 / 却下
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/reports" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">通報一覧</div>
              <div className="text-xs text-gray-500 mt-1">
                通報内容の確認・対応ステータス変更
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/settings" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">システム設定</div>
              <div className="text-xs text-gray-500 mt-1">
                管理者／一般管理者の権限区分・手数料（売上分配率）の設定
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

        <Link to="/admin/shops/create" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">Shop作成</div>
              <div className="text-xs text-gray-500 mt-1">
                運営管理者がShopを新規発行（owner紐付けは任意）
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>        

        <Link to="/admin/shops/members" className="card card-link">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">Shopメンバー復旧</div>
              <div className="text-xs text-gray-500 mt-1">
                shopId と userId を指定して ShopMember（owner/admin/staff）を付与
              </div>
            </div>
            <span className="text-lg text-gray-400">›</span>
          </div>
        </Link>

          <Link to="/admin/notifications" className="card card-link">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">通知一覧</div>
                <div className="text-xs text-gray-500 mt-1">
                  通報・出金申請・KYCなどの運営向け通知
                </div>
              </div>
              <span className="text-lg text-gray-400">›</span>
            </div>
          </Link>

          <Link to="/admin/announcements" className="card card-link" style={{ textDecoration: "none" }}>
            <div className="section-subtitle">サイト設定・告知管理</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: 6 }}>
              キャンペーン告知
            </div>
            <div className="section-subtitle" style={{ marginTop: 6 }}>
              バナー/本文・期間・有効/無効
            </div>
          </Link>   

      </section>

      {/* サマリー */}
      <section className="card">
        <div className="section-title mb-3">サマリー</div>

        {isLoading && (
          <div className="text-xs text-gray-500 mb-2">読み込み中…</div>
        )}

        {error && (
          <div className="text-xs text-red-600 mb-3">
            {/401|Unauthorized/i.test(String(error))
              ? 'ログインが切れています。再ログインしてください。'
              : <>管理サマリを取得できませんでした。<br />API <code>/admin/summary</code> の未実装または権限不足の可能性があります。</>}
          </div>
        )}

        <div className="summary-grid">
          <Link to="/admin/summary" className="summary-item">
            <div className="summary-label">月間売上</div>
            <div className="summary-value">
              ¥{summary.salesMonthly.toLocaleString()}
            </div>
          </Link>

          <Link to="/admin/creators" className="summary-item">
            <div className="summary-label">新規登録</div>
            <div className="summary-value">
              {summary.newUsersMonthly.toLocaleString()}
            </div>
          </Link>

          <Link to="/admin/reports" className="summary-item">
            <div className="summary-label">通報(未対応)</div>
            <div className="summary-value">
              {summary.reportsPending.toLocaleString()}
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export function AdminDashboard() {
  return <AdminInner />;
}