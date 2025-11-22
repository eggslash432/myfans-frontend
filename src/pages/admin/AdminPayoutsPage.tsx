import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { adminApprovePayout } from '../../lib/api';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/admin/payouts');
    setPayouts(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('この出金申請を承認し、Stripe送金しますか？')) return;

    const res = await adminApprovePayout(id);
    alert(`送金完了: Transfer ID = ${res.transferId}`);

    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">出金申請一覧</h1>

      <table className="table-auto w-full border">
        <thead>
          <tr className="border-b">
            <th>ID</th>
            <th>Creator</th>
            <th>Amount (JPY)</th>
            <th>Status</th>
            <th>RequestedAt</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {payouts.map((p) => (
            <tr key={p.id} className="border-b">
              <td>{p.id}</td>
              <td>{p.creatorId}</td>
              <td>{p.amountJpy}</td>
              <td>{p.payoutStatus}</td>
              <td>{p.requestedAt}</td>

              <td>
                {p.payoutStatus === 'requested' && (
                  <button
                    onClick={() => handleApprove(p.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    承認して送金
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
