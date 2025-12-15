// front/src/pages/admin/AdminSummaryPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetSummary } from '../../lib/api/admin'; 
import type { AdminSummary } from '../../shared/types';

export default function AdminSummaryPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await adminGetSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
      setErr('サマリ情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* ヘッダー行 */}
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: '4px' }}
        >
          <h1
            className="page-title"
            style={{ marginBottom: 0, textAlign: 'left' }}
          >
            管理サマリ
          </h1>

          <button
            type="button"
            onClick={load}
            className="btn btn-outline btn-sm"
          >
            ⟳ 再読み込み
          </button>
        </div>

        {loading && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            読み込み中…
          </div>
        )}

        {err && (
          <div className="auth-error">
            {err}
          </div>
        )}

        {!loading && !err && summary && (
          <div className="space-y-3">
            {/* 今月の売上 */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-title" style={{ marginBottom: 6 }}>
                今月の売上
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                ¥{summary.salesMonthly.toLocaleString()}
              </div>
              <div className="section-subtitle">
                今月1日から現在までの payment 合計金額
              </div>
            </div>

            {/* 今月の新規ユーザー */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-title" style={{ marginBottom: 6 }}>
                今月の新規ユーザー
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {summary.newUsersMonthly.toLocaleString()} 名
              </div>
              <div className="section-subtitle">
                今月1日以降に登録されたユーザー数
              </div>
            </div>

            {/* 通報状況 */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="section-title" style={{ marginBottom: 6 }}>
                通報状況
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 4,
                  color: summary.reportsPending > 0 ? '#ef4444' : '#16a34a',
                }}
              >
                {summary.reportsPending} 件
              </div>
              <div className="section-subtitle" style={{ marginBottom: 10 }}>
                ステータス pending の通報数
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/admin/reports">
                  <button className="btn btn-primary btn-sm">
                    通報一覧を開く
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
