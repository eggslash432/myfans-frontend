// front/src/pages/shop/ShopSalesPage.tsx

type DailySale = {
  date: string;
  gross: number;
  platformFee: number;
  net: number;
  transactions: number;
};

const MOCK_SALES: DailySale[] = [
  { date: "2025-12-16", gross: 12800, platformFee: 1280, net: 11520, transactions: 8 },
  { date: "2025-12-15", gross: 54000, platformFee: 5400, net: 48600, transactions: 32 },
  { date: "2025-12-14", gross: 32100, platformFee: 3210, net: 28890, transactions: 19 },
];

const yen = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);

export default function ShopSalesPage() {
  return (
    <div className="page">
      <h1 className="page-title">売上（日次）</h1>

      <div className="card">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
              <th>日付</th>
              <th>売上（総額）</th>
              <th>手数料</th>
              <th>入金対象</th>
              <th>取引数</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_SALES.map((s) => (
              <tr key={s.date} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td>{s.date}</td>
                <td>{yen(s.gross)}</td>
                <td>{yen(s.platformFee)}</td>
                <td style={{ fontWeight: 700 }}>{yen(s.net)}</td>
                <td>{s.transactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
