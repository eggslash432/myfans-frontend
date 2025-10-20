import { useEffect, useState } from 'react';
import { admin } from '../../lib/api';

export default function CreatorsAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await admin.listPendingCreators();
      setItems(Array.isArray(res?.items) ? res.items : []);
    } catch (e: any) {
      setErr(e?.message ?? '読み込み失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (userId: string) => {
    try {
      await admin.setCreatorListing(userId, true);
      setMsg('掲載に変更しました');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? '承認に失敗しました');
    }
  };

  const unlist = async (userId: string) => {
    try {
      await admin.setCreatorListing(userId, false);
      setMsg('非掲載に変更しました');
      await load();
    } catch (e: any) {
      setErr(e?.message ?? '非掲載に失敗しました');
    }
  };

  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">クリエイター承認</h1>

      {msg && <div className="mb-3 text-green-700">{msg}</div>}
      {err && <div className="mb-3 text-red-600">{err}</div>}

      {items.length === 0 ? (
        <p className="text-gray-500">審査待ちはありません。</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="border rounded p-4 flex items-start justify-between">
              <div>
                <div className="font-semibold">{c.displayName} <span className="text-xs text-gray-500">({c.email})</span></div>
                {c.bio && <div className="text-sm text-gray-600 mt-1">{c.bio}</div>}
                <div className="text-xs text-gray-400 mt-1">登録: {new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded bg-black text-white" onClick={() => approve(c.id)}>掲載にする</button>
                <button className="px-3 py-2 rounded border" onClick={() => unlist(c.id)}>非掲載にする</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
