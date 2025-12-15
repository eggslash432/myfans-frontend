// front/src/pages/payments/Success.tsx

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getUserMe } from "../../lib/api"; // ✅こっちに寄せる
import type { MeSummary } from "../../shared/types"; // ✅型も合わせる

export default function Success() {
  const [params] = useSearchParams();
  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [msg, setMsg] = useState("反映中...");

  const planName = params.get("plan") ?? "";

  useEffect(() => {
    let mounted = true;
    let tries = 0;

    const fetchSummary = async () => {
      try {
        const s = await getUserMe();
        if (!mounted) return;
        setSummary(s);
        setMsg("反映完了");
      } catch (e: any) {
        if (!mounted) return;
        if (tries++ < 6) setTimeout(fetchSummary, 1500);
        else setMsg(`反映に失敗: ${e?.message ?? String(e)}`);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page space-y-4">
      <h1 className="page-title">決済成功</h1>

      <section className="card space-y-2">
        <div className="text-sm">{msg}</div>
        {planName ? (
          <div className="text-xs text-gray-500">プラン: {planName}</div>
        ) : null}

        <div className="pt-2">
          <Link to="/mypage" className="btn btn-primary">
            マイページへ
          </Link>
        </div>

        {summary ? (
          <pre className="bg-gray-50 p-3 rounded overflow-auto text-xs">
            {JSON.stringify(summary, null, 2)}
          </pre>
        ) : null}
      </section>
    </div>
  );
}
