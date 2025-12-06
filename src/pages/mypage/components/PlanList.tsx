export default function PlanList({
  onSubscribe,
  loading,
}: { onSubscribe: (planId: string) => void; loading: boolean; }) {
  const plans = [
    { id: 'basic', name: 'ベーシック', price: 1000 },
    { id: 'premium', name: 'プレミアム', price: 3000 },
  ];
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">プラン一覧</h2>
      <div className="space-y-2">
        {plans.map(p => (
          <button
            key={p.id}
            className="w-full text-left border rounded p-2 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onSubscribe(p.id)}
            disabled={loading}
          >
            {p.name}　¥{p.price}/月
          </button>
        ))}
      </div>
    </div>
  );
}
