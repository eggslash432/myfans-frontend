// front/src/pages/admin/reports/hooks/useAdminReports.ts

import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
} from "@/lib";
import type { 
  ReportItem,
  ReportStatus, 
} from "@/shared";
import { adminListReports, adminResolveReport, adminUpdatePostStatus } from "../api";

type BusyKey = string | null; // reportId or `post:${postId}`

export function useAdminReports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyKey, setBusyKey] = useState<BusyKey>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await adminListReports();
      setReports(data);
    } catch (e: any) {
      if (e instanceof ApiError) {
        if (e.status === 404) {
          console.warn("/admin/reports が 404 のため空リスト扱いにします", e);
          setReports([]);
          setErr("");
        } else {
          console.error(e);
          setErr(e.body?.message ?? "通報一覧の取得に失敗しました。");
        }
      } else {
        console.error(e);
        setErr("通報一覧の取得に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resolve = useCallback(
    async (id: string, action: ReportStatus) => {
      const msg =
        action === "reviewed"
          ? "この通報を「対応済み」にしますか？"
          : "この通報を「却下」にしますか？";
      if (!confirm(msg)) return;

      try {
        setBusyKey(id);
        await adminResolveReport(id, action);
        await load();
      } catch (e: any) {
        console.error(e);
        alert(e?.message ?? "通報の更新に失敗しました。");
      } finally {
        setBusyKey(null);
      }
    },
    [load],
  );

  const makePrivate = useCallback(
    async (postId: string) => {
      if (!confirm("この投稿を「非公開」にしますか？")) return;

      try {
        setBusyKey(`post:${postId}`);
        await adminUpdatePostStatus(postId, "private");
        await load();
      } catch (e: any) {
        console.error(e);
        alert(e?.message ?? "投稿の非公開に失敗しました。");
      } finally {
        setBusyKey(null);
      }
    },
    [load],
  );

  return { reports, loading, err, busyKey, load, resolve, makePrivate };
}
