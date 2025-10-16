import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function MyPage() {
  const {user, ready} = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try { setSummary(await api.meSummary()); } 
      catch (e: any) { setErr(e.message || 'failed'); }
    })();
  }, [ready, user]);

  if (!ready) return <div className="p-4">読み込み中...</div>;
  if (!user) return <div className="p-4">ログインが必要です。右上の「ログイン」からサインインしてください。</div>;
  if (err) return <div className="p-4 text-red-700">{/Unauthorized|401/i.test(err) ? 'ログインが必要です。右上の「ログイン」からサインインしてください。' : `サマリー取得に失敗: ${err}`}</div>;
  if (!summary) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">マイページ</h1>
      <section className="p-4 rounded border">
        <h2 className="font-semibold">購読状況</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(summary.subscriptions || [], null, 2)}</pre>
      </section>
      <section className="p-4 rounded border">
        <h2 className="font-semibold">支払い履歴</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(summary.payments || [], null, 2)}</pre>
      </section>
    </div>
  );
}
