import { useEffect, useState } from 'react';
import { admin, ApiError } from '../../lib/api';
import type { ReportItem } from '../../shared/types';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await admin.listReports(); // ← api.ts の admin オブジェクト
      setReports(data ?? []);
    } catch (e: any) {
      if (e instanceof ApiError) {
        // ★ API 未実装で 404 のときは「通報なし」として扱う
        if (e.status === 404) {
          console.warn('/admin/reports が 404 のため空リスト扱いにします', e);
          setReports([]);
          setErr('');
        } else {
          console.error(e);
          setErr(e.body?.message ?? '通報一覧の取得に失敗しました。');
        }
      } else {
        console.error(e);
        setErr('通報一覧の取得に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleResolve = async (
    id: string,
    action: 'reviewed' | 'dismissed',
  ) => {
    if (
      !confirm(
        action === 'reviewed'
          ? 'この通報を「対応済み」にしますか？'
          : 'この通報を「却下」にしますか？',
      )
    ) {
      return;
    }
    try {
      await admin.resolveReport(id, action);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '通報の更新に失敗しました。');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">通報一覧</h1>
        <button
          type="button"
          onClick={load}
          className="px-3 py-1 text-xs border rounded"
        >
          再読み込み
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500">読み込み中...</div>}

      {err && (
        <div className="text-sm text-red-600">
          {err}
        </div>
      )}

      {!loading && !err && reports.length === 0 && (
        <div className="text-sm text-gray-600">
          現在、通報はありません。
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="space-y-3 text-sm">
          {reports.map((r) => (
            <div
              key={r.id}
              className="border rounded p-3 flex flex-col gap-1 bg-white"
            >
              <div className="font-semibold">
                通報ID: {r.id}
              </div>
              <div>
                投稿: {r.postTitle || '（タイトルなし）'}{' '}
                {r.postId && (
                  <span className="text-xs text-gray-500">ID: {r.postId}</span>
                )}
              </div>
              <div>通報者: {r.reporterEmail || '（不明）'}</div>
              <div>理由: {r.reason || '(未入力)'}</div>
              <div className="text-xs text-gray-500">
                日時:{' '}
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleString()
                  : '(不明)'}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve(r.id, 'reviewed')}
                  className="px-3 py-1 text-xs bg-black text-white rounded"
                >
                  対応済みにする
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(r.id, 'dismissed')}
                  className="px-3 py-1 text-xs border rounded"
                >
                  却下
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
