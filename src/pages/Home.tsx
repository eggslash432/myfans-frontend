import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [creators, setCreators] = useState<any[]>([]);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      try { setCreators((await api.listCreators())?.items ?? []); } catch (e:any) { setErr(e.message||'failed'); }
    })();
  }, []);

  if (err) return <div className="p-6 text-red-700">読み込み失敗: {err}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">クリエイター</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((c:any)=>(
          <Link key={c.id} to={`/creators/${c.id}`} className="border rounded-xl p-4 hover:shadow-md transition">
            <div className="text-lg font-semibold">{c.displayName || c.name}</div>
            <div className="opacity-70 text-sm line-clamp-2">{c.bio}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
