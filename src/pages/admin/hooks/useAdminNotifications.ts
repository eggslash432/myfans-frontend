// front/src/hooks/useAdminNotifications.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { NotificationSource, NotificationType } from "@/shared/prisma-enums";
import {
  adminListNotifications,
  markNotificationAsRead,
  type AdminNotifRow,
} from "@/lib/api/adminNotifications";

export function useAdminNotifications() {
  const [items, setItems] = useState<AdminNotifRow[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [userId, setUserId] = useState("");
  const [type, setType] = useState<NotificationType | "">("");
  const [source, setSource] = useState<NotificationSource | "">("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // paging
  const [take, setTake] = useState(50);
  const [skip, setSkip] = useState(0);

  const searchKey = useMemo(() => {
    return JSON.stringify({
      userId: userId.trim(),
      type,
      source,
      unreadOnly,
      take,
      skip,
    });
  }, [userId, type, source, unreadOnly, take, skip]);

  const loadSeq = useRef(0);

  const load = async () => {
    const seq = ++loadSeq.current;
    try {
      setLoading(true);
      setErr("");

      const data = await adminListNotifications({
        userId: userId.trim() || undefined,
        type: type || undefined,
        source: source || undefined,
        unreadOnly,
        take,
        skip,
      });

      if (seq !== loadSeq.current) return; // stale

      setItems(data.items ?? []);
      setTotal(typeof data.total === "number" ? data.total : null);
    } catch (e) {
      console.error(e);
      setErr("通知一覧の取得に失敗しました。");
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  const resetAndSearch = () => setSkip(0);
  const nextPage = () => setSkip((v) => v + take);
  const prevPage = () => setSkip((v) => Math.max(0, v - take));

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setItems((rows) =>
        rows.map((r) =>
          r.id === id ? { ...r, readAt: r.readAt ?? new Date().toISOString() } : r,
        ),
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
    // data
    items,
    total,
    loading,
    err,

    // filters state
    userId,
    setUserId,
    type,
    setType,
    source,
    setSource,
    unreadOnly,
    setUnreadOnly,

    // paging
    take,
    setTake,
    skip,
    setSkip,
    nextPage,
    prevPage,

    // actions
    load,
    resetAndSearch,
    markAsRead,
  };
}
