// src/pages/checkout/Success.tsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';

type Summary = any; // ★ 型未確定なら当面 any でOK（検収優先）

export default function Success() {
  const [params] = useSearchParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [msg, setMsg] = useState<string>('反映中...');

  // URLに ?plan=Basic などが付いていなくてもOKなように
  const planName = params.get('plan') ?? '';

  useEffect(() => {
    let mounted = true;
    let tries = 0;

    const fetchSummary = async () => {
      try {
        const s = await api.meSummary();
        if (!mounted) return;
        setSummary(s);
        setMsg('反映完了');
      } catch (e: any) {
        if (tries++ < 6) {
          // Webhook反映の遅延対策でリトライ
          setTimeout(fetchSummary, 1500);
        } else {
          setMsg(`反映に失敗: ${e?.message ?? String(e)}`);
        }
      }
    };

    fetchSummary();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">決済成功</h1>
      <div>{msg}</div>

      {planName ? (
        <div className="opacity-70 text-sm">プラン: {planName}</div>
      ) : null}

      <div>
        <Link to="/mypage" className="underline">マイページを見る</Link>
      </div>

      {summary ? (
        <pre className="bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(summary, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
