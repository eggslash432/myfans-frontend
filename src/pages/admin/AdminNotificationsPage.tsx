// front/src/pages/admin/AdminNotificationsPage.tsx

import { AdminNotificationsComposer, AdminNotificationsFilters, AdminNotificationsList, useAdminNotifications } from "@/features/admin";



export function AdminNotificationsPage() {
  const n = useAdminNotifications();

  const onClickUnread = async (id: string) => {
    try {
      await n.markAsRead(id);
    } catch {
      alert("既読化に失敗しました（権限/APIを確認してください）");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>通知（管理）</h1>

      <AdminNotificationsFilters
        userId={n.userId}
        setUserId={n.setUserId}
        type={n.type}
        setType={n.setType}
        source={n.source}
        setSource={n.setSource}
        unreadOnly={n.unreadOnly}
        setUnreadOnly={n.setUnreadOnly}
        take={n.take}
        setTake={n.setTake}
        skip={n.skip}
        nextPage={n.nextPage}
        prevPage={n.prevPage}
        loading={n.loading}
        itemsCount={n.items.length}
        total={n.total}
        resetAndSearch={n.resetAndSearch}
        reload={() => void n.load()}
      />

      <AdminNotificationsComposer onSent={() => void n.load()} />

      {n.err && <div style={{ marginTop: 12, color: "crimson" }}>{n.err}</div>}
      {n.loading && <div style={{ marginTop: 12 }}>Loading...</div>}

      <AdminNotificationsList items={n.items} onClickUnread={onClickUnread} />
    </div>
  );
}
