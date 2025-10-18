// src/pages/Home.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function HomePage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listCreators(); 
        setCreators(list);
      } catch (err: any) {
        setError(err?.message || "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center">読み込み中...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">クリエイター</h1>
      {!Array.isArray(creators) || creators.length === 0 ? (
        <p className="text-gray-500">現在クリエイターが登録されていません。</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {creators.map((c) => (
            <Link
              to={`/creators/${c?.id ?? ""}`}
              key={c?.id ?? Math.random()}
              className="border rounded-lg p-4 hover:shadow transition"
            >
              <h2 className="font-semibold text-lg">{c.name || c.displayName || `Creator #${c.id}`}</h2>
              {c.bio && <p className="text-sm text-gray-600 mt-1">{c.bio}</p>}
              <p className="text-xs text-gray-400 mt-2">{c.email || ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
