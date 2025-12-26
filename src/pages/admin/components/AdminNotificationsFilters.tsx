// front/src/pages/admin/components/AdminNotificationsFilters.tsx
import type { NotificationSource, NotificationType } from "@/shared/prisma-enums";

export function AdminNotificationsFilters(props: {
  userId: string;
  setUserId: (v: string) => void;

  type: NotificationType | "";
  setType: (v: NotificationType | "") => void;

  source: NotificationSource | "";
  setSource: (v: NotificationSource | "") => void;

  unreadOnly: boolean;
  setUnreadOnly: (v: boolean) => void;

  take: number;
  setTake: (v: number) => void;

  skip: number;
  nextPage: () => void;
  prevPage: () => void;

  loading: boolean;
  itemsCount: number;
  total: number | null;

  resetAndSearch: () => void;
  reload: () => void;
}) {
  const {
    userId, setUserId,
    type, setType,
    source, setSource,
    unreadOnly, setUnreadOnly,
    take, setTake,
    skip, nextPage, prevPage,
    loading, itemsCount, total,
    resetAndSearch, reload,
  } = props;

  const onEnterSearch: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") resetAndSearch();
  };

  return (
    <div className="card" style={{ marginTop: 12, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          userId:
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={onEnterSearch}
            placeholder="完全一致"
            style={{ marginLeft: 6, width: 320 }}
          />
        </label>

        <label>
          type:
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as any);
              resetAndSearch();
            }}
            style={{ marginLeft: 6 }}
          >
            <option value="">ALL</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="KYC">KYC</option>
            <option value="REPORT">REPORT</option>
            <option value="POST">POST</option>
            <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          </select>
        </label>

        <label>
          source:
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value as any);
              resetAndSearch();
            }}
            style={{ marginLeft: 6 }}
          >
            <option value="">ALL</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="ADMIN">ADMIN</option>
            <option value="WEBHOOK">WEBHOOK</option>
          </select>
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              resetAndSearch();
            }}
          />
          unread only
        </label>

        <label>
          take:
          <select
            value={take}
            onChange={(e) => {
              setTake(Number(e.target.value));
              // take変更時は先頭から見たい
              resetAndSearch();
            }}
            style={{ marginLeft: 6 }}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>

        <button onClick={resetAndSearch} disabled={loading} title="skipを0に戻して検索">
          検索
        </button>

        <button onClick={reload} disabled={loading} title="同じ条件で再読み込み">
          再読み込み
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={prevPage} disabled={loading || skip === 0}>
            前へ
          </button>
          <button onClick={nextPage} disabled={loading || itemsCount < take}>
            次へ
          </button>
        </div>
      </div>

      <div style={{ opacity: 0.7, fontSize: 12 }}>
        表示: {itemsCount} 件 / skip={skip}
        {typeof total === "number" ? ` / total=${total}` : ""}
      </div>
    </div>
  );
}
