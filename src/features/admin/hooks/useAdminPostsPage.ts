// front/src/pages/admin/hooks/useAdminPostsPage.ts

import { useCallback, useEffect, useState } from "react";
import type { 
  AdminPost,
  PublishedStatus, 
  ReportItem
} from "@/shared";
import { 
  ApiError, 
} from "@/lib";
import { adminDeletePost, adminListPosts, adminListReports, adminResolveReport, adminUpdatePostStatus } from "../api";

export function useAdminPostsPage() {
  const [list, setList] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsPostId, setReportsPostId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await adminListPosts();
      setList(data);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) {
        setErr("AUTH_EXPIRED");
        setList([]);
        return;
      }
      if (e instanceof ApiError && e.status === 404) {
        console.warn("/admin/posts 未実装のため空リスト扱い", e);
        setList([]);
        setErr("");
        return;
      }
      console.error(e);
      setErr(e?.message ?? "投稿一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const deletePost = useCallback(
    async (id: string) => {
      if (!confirm("この投稿を削除しますか？この操作は元に戻せません。")) return;
      try {
        await adminDeletePost(id);
        await load();
      } catch (e: any) {
        alert(e?.message ?? "削除に失敗しました");
      }
    },
    [load],
  );

  const updateStatus = useCallback(
    async (id: string, status: PublishedStatus, statusLabel: string) => {
      if (!confirm(`この投稿の状態を「${statusLabel}」に変更しますか？`)) return;
      try {
        await adminUpdatePostStatus(id, status);
        await load();
      } catch (e: any) {
        alert(e?.message ?? "状態変更に失敗しました");
      }
    },
    [load],
  );

  const openReports = useCallback(async (postId: string) => {
    try {
      const data = await adminListReports({ postId });
      setReports(data);
      setReportsPostId(postId);
    } catch (e: any) {
      alert(e?.message ?? "通報一覧の取得に失敗しました");
    }
  }, []);

  const resolveReport = useCallback(async (reportId: string, action: "reviewed" | "dismissed") => {
    try {
      await adminResolveReport(reportId, action);
      if (reportsPostId) {
        const data = await adminListReports({ postId: reportsPostId });
        setReports(data);
      }
    } catch (e: any) {
      alert(e?.message ?? "通報の更新に失敗しました");
    }
  }, [reportsPostId]);

  const closeModal = useCallback(() => {
    setReportsPostId(null);
    setReports([]);
  }, []);

  return {
    list,
    loading,
    err,
    load,
    deletePost,
    updateStatus,
    reports,
    reportsPostId,
    openReports,
    resolveReport,
    closeModal,
  };
}
