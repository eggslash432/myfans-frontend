// front/src/pages/admin/AdminCreatorsPage.tsx
import { useEffect, useMemo, useState } from "react";

import CreatorApplicationsFilter from "./components/CreatorApplicationsFilter";
import CreatorApplicationCard from "./components/CreatorApplicationCard";
import CreatorRejectModal from "./components/CreatorRejectModal";
import { filterByKeyword } from "./domain/creatorsAdminView";

import type { 
  CreatorApplication, 
  CreatorApprovalStatusFilter 
} from "@/shared";
import { 
  adminApproveCreatorApplication, 
  adminListCreatorApplications, 
  adminRejectCreatorApplication, 
  ApiError 
} from "@/lib/api";


export function AdminCreatorsPage() {
  const [list, setList] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [status, setStatus] = useState<CreatorApprovalStatusFilter>("pending");
  const [q, setQ] = useState("");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<CreatorApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await adminListCreatorApplications({
        status: status === "all" ? undefined : status,
        q: q.trim() ? q.trim() : undefined,
      });

      setList(res.items ?? []);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 404) {
        setList([]);
        setErr("");
      } else {
        console.error(e);
        setErr(e?.message ?? "申請一覧の取得に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => filterByKeyword(list, q), [list, q]);

  const handleApprove = async (userId: string) => {
    if (!confirm("このクリエイター申請を承認しますか？")) return;
    try {
      setBusy(true);
      await adminApproveCreatorApplication(userId);
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "承認に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const openRejectModal = (item: CreatorApplication) => {
    setRejectTarget(item);
    setRejectReason("");
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTarget) return;

    const reason = rejectReason.trim();
    if (!reason) {
      alert("却下理由を入力してください");
      return;
    }
    if (!confirm("この申請を却下しますか？")) return;

    try {
      setBusy(true);
      await adminRejectCreatorApplication(rejectTarget.userId, reason);
      setRejectOpen(false);
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "却下に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page max-w-lg mx-auto">
      <h1 className="page-title">クリエイター申請管理</h1>

      <CreatorApplicationsFilter
        status={status}
        onChangeStatus={setStatus}
        q={q}
        onChangeQ={setQ}
        onSearch={load}
        onReload={load}
        busy={busy}
      />

      {loading && <div className="mt-2 text-xs text-gray-500 text-center">読み込み中...</div>}
      {err && <div className="mt-2 text-xs text-red-600 text-center">{err}</div>}

      {!loading && !err && filtered.length === 0 && (
        <div className="mt-4 text-sm text-center text-gray-600">該当する申請はありません。</div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-4 admin-cards">
          {filtered.map((c) => (
            <CreatorApplicationCard
              key={c.userId}
              item={c}
              busy={busy}
              onApprove={handleApprove}
              onOpenReject={openRejectModal}
            />
          ))}
        </div>
      )}

      <CreatorRejectModal
        open={rejectOpen}
        busy={busy}
        target={rejectTarget}
        reason={rejectReason}
        onChangeReason={setRejectReason}
        onClose={() => {
          if (busy) return;
          setRejectOpen(false);
        }}
        onSubmit={submitReject}
      />
    </div>
  );
}
