// front/src/pages/admin/CreatorsAdminPage.tsx

import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../lib/api/apiClient';
import {
  adminListCreatorApplications,
  adminApproveCreatorApplication,
  adminRejectCreatorApplication,
} from '../../lib/api/admin';
import type { CreatorApplication, CreatorApprovalStatus } from '../../shared/types';

type CreatorApprovalStatusFilter = CreatorApprovalStatus | 'all';

export default function CreatorsAdminPage() {
  const [list, setList] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // フィルタ
  const [status, setStatus] = useState<CreatorApprovalStatusFilter>('pending');
  const [q, setQ] = useState('');

  // 却下モーダル
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<CreatorApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const res = await adminListCreatorApplications({
        status: status === 'all' ? undefined : status,
        q: q.trim() ? q.trim() : undefined,
      });
      setList(res.items ?? []);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 404) {
        setList([]);
        setErr('');
      } else {
        console.error(e);
        setErr(e?.message ?? '申請一覧の取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter((x) => {
      return (
        x.email.toLowerCase().includes(keyword) ||
        (x.publicName ?? '').toLowerCase().includes(keyword) ||
        (x.displayName ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [list, q]);

  const handleApprove = async (userId: string) => {
    if (!confirm('このクリエイター申請を承認しますか？')) return;
    try {
      setBusy(true);
      await adminApproveCreatorApplication(userId);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '承認に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const openRejectModal = (item: CreatorApplication) => {
    setRejectTarget(item);
    setRejectReason('');
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      alert('却下理由を入力してください');
      return;
    }
    if (!confirm('この申請を却下しますか？')) return;

    try {
      setBusy(true);
      await adminRejectCreatorApplication(rejectTarget.userId, reason);
      setRejectOpen(false);
      setRejectTarget(null);
      setRejectReason('');
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? '却下に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const statusLabel = (s: CreatorApprovalStatusFilter) =>
    s === 'pending' ? '審査中' : s === 'approved' ? '承認済み' : s === 'rejected' ? '却下' : '全て';

  const badgeClass = (s: CreatorApprovalStatus) =>
    s === 'pending' ? 'badge badge-warning' : s === 'approved' ? 'badge badge-success' : 'badge badge-red';

  return (
    <div className="page max-w-lg mx-auto">
      <h1 className="page-title">クリエイター申請管理</h1>

      {/* フィルタ（admin.css の admin-filter を使う） */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">フィルタ</div>
          <button
            className="btn btn-outline btn-sm"
            onClick={load}
            disabled={busy}
            type="button"
          >
            再読み込み
          </button>
        </div>

        {/* status chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as CreatorApprovalStatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatus(s)}
              disabled={busy}
            >
              {s === 'pending' ? '審査中' : s === 'approved' ? '承認済み' : s === 'rejected' ? '却下' : '全て'}
            </button>
          ))}
        </div>

        {/* search row */}
        <div className="mt-3 flex gap-2">
          <input
            className="admin-input w-full"
            placeholder="検索（email / 表示名） 例: creator2 / example"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
          />
          <button
            className="btn btn-primary"
            onClick={load}
            disabled={busy}
            type="button"
          >
            検索
          </button>
        </div>
      </div>

      {loading && <div className="mt-2 text-xs text-gray-500 text-center">読み込み中...</div>}
      {err && <div className="mt-2 text-xs text-red-600 text-center">{err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">該当する申請はありません。</div>
      )}

      {/* 一覧（admin.css の admin-cards / admin-post-card を使う） */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 admin-cards">
          {filtered.map((c) => (
            <div key={c.userId} className="admin-post-card" style={{ padding: 14 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="admin-post-title truncate">
                    {c.publicName || c.displayName || '（表示名未設定）'}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{c.email}</div>
                </div>

                <span className={badgeClass(c.approvalStatus)}>{statusLabel(c.approvalStatus)}</span>
              </div>

              <div className="admin-post-meta">
                <span>申請日：{new Date(c.createdAt).toLocaleString()}</span>
                {typeof c.applicationCount === 'number' && <span>再申請：{c.applicationCount} 回</span>}
                {c.lastAppliedAt && <span>最終申請：{new Date(c.lastAppliedAt).toLocaleString()}</span>}
              </div>

              {c.approvalStatus === 'rejected' && c.rejectReason && (
                <div className="mt-2 text-[12px] text-red-600">
                  却下理由：{c.rejectReason}
                </div>
              )}

              <div className="admin-post-actions">
                {c.approvalStatus === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(c.userId)}
                      disabled={busy}
                    >
                      承認
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm text-red-600"
                      onClick={() => openRejectModal(c)}
                      disabled={busy}
                    >
                      却下
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => openRejectModal(c)}
                    disabled={busy}
                  >
                    詳細
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 却下モーダル（既存の card / btn を活かす） */}
      {rejectOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (busy) return;
            setRejectOpen(false);
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">却下理由</div>
              <div className="modal-subtitle">ユーザーに表示されます</div>
            </div>

            <div className="text-sm font-semibold">
              対象：{rejectTarget?.publicName || rejectTarget?.displayName}（{rejectTarget?.email}）
            </div>

            <div className="modal-body">
              <label className="modal-label">理由</label>
              <textarea
                className="modal-textarea"
                placeholder="例：本人確認書類の不鮮明、プロフィール不備 など"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setRejectOpen(false)} disabled={busy}>
                キャンセル
              </button>
              <button type="button" className="btn btn-primary" onClick={submitReject} disabled={busy}>
                却下する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
