// front/src/pages/creator/CreatorPayoutsPage/PayoutBalanceCard.tsx
export function PayoutBalanceCard(props: { balance: number | null }) {
  const { balance } = props;
  return (
    <section className="card space-y-2">
      <div className="text-sm text-gray-600">出金可能残高</div>
      <div className="text-2xl font-semibold">
        {balance == null ? "読み込み中…" : `¥${balance.toLocaleString()}`}
      </div>
    </section>
  );
}
