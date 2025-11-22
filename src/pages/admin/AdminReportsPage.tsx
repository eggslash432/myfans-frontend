import { useEffect, useState } from 'react';
import { getReports, resolveReport } from '../../lib/api';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleResolve = async (id: string, action: 'reviewed' | 'dismissed') => {
    await resolveReport(id, action);
    await reload();
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>通報一覧（未対応）</h1>
      {reports.length === 0 && <p>未対応の通報はありません。</p>}
      {reports.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', marginBottom: 8, padding: 8 }}>
          <div>通報ID: {r.id}</div>
          <div>投稿: {r.post?.title} (ID: {r.post?.id})</div>
          <div>通報者: {r.user?.email}</div>
          <div>理由: {r.reason || '(未入力)'}</div>
          <div>日時: {new Date(r.createdAt).toLocaleString()}</div>
          <button onClick={() => handleResolve(r.id, 'reviewed')}>対応済みにする</button>
          <button onClick={() => handleResolve(r.id, 'dismissed')}>却下</button>
        </div>
      ))}
    </div>
  );
}
