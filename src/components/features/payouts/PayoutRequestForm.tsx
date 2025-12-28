// front/src/pages/creator/CreatorPayoutsPage/PayoutRequestForm.tsx
export function PayoutRequestForm(props: {
  amount: string;
  loading: boolean;
  onChangeAmount: (v: string) => void;
  onSubmit: () => void;
}) {
  const { amount, loading, onChangeAmount, onSubmit } = props;

  return (
    <section className="card space-y-3">
      <div className="section-title">出金リクエスト</div>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="number"
          className="form-input w-40"
          placeholder="金額（円）"
          value={amount}
          onChange={(e) => onChangeAmount(e.target.value)}
        />
        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? "送信中…" : "出金申請する"}
        </button>
      </div>
      <p className="text-xs text-gray-500">出金可能残高の範囲内で申請できます。</p>
    </section>
  );
}
