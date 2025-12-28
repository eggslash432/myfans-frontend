// front/src/pages/payments/Success.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getUserMe } from "@/lib/api";
import { 
  formatDate, 
  type MeSummary 
} from "@/shared";

export function Success() {
  const [params] = useSearchParams();
  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [msg, setMsg] = useState("反映中...");
  const [showDebug, setShowDebug] = useState(false);

  const from = params.get("from"); // "plan" | "ppv"
  const planId = params.get("planId");
  const postId = params.get("postId");

  const title = useMemo(() => {
    if (from === "plan") return "プラン購読が完了しました";
    if (from === "ppv") return "単品購入が完了しました";
    return "決済が完了しました";
  }, [from]);

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

  // ✅ 今回の購読（planId で探す。無ければ先頭をそれっぽく出す）
  const matchedSub = useMemo(() => {
    if (!summary || from !== "plan") return null;
    const subs = summary.subscriptions ?? [];
    if (planId) return subs.find((s: any) => s.plan?.id === planId) ?? null;
    return subs[0] ?? null;
  }, [summary, from, planId]);

  // ✅ 支払いは最新1件を表示（この直後なので大体これ）
  const matchedPayment = useMemo(() => {
    if (!summary) return null;
    return (summary.payments ?? [])[0] ?? null;
  }, [summary]);

  return (
    <div className="page space-y-4">
      <h1 className="page-title">決済成功</h1>

      <section className="card space-y-3">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-sm text-gray-500 mt-1">{msg}</div>
        </div>

        {(matchedSub || matchedPayment) && (
          <div className="grid gap-2">
            {matchedSub && (
              <div className="rounded-xl border border-gray-100 p-3">
                <div className="text-xs text-gray-500">購読プラン</div>

                <div className="text-sm font-semibold truncate">
                  {matchedSub.plan?.name ?? "（プラン名未取得）"}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {matchedSub.creator?.publicName
                    ? `クリエイター: ${matchedSub.creator.publicName}`
                    : null}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  期間: {formatDate(matchedSub.currentPeriodStart)} 〜{" "}
                  {formatDate(matchedSub.currentPeriodEnd)}
                  {matchedSub.cancelAtPeriodEnd ? "（次回更新で解約）" : ""}
                </div>
              </div>
            )}

            {matchedPayment && (
              <div className="rounded-xl border border-gray-100 p-3">
                <div className="text-xs text-gray-500">支払い</div>
                <div className="text-sm font-semibold">
                  ¥{matchedPayment.amountJpy?.toLocaleString?.() ?? matchedPayment.amountJpy}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  日時: {formatDate(matchedPayment.paidAt ?? matchedPayment.createdAt)}
                </div>
                {matchedPayment.creator?.publicName && (
                  <div className="text-xs text-gray-500 mt-1">
                    {matchedPayment.creator.publicName}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-1 flex gap-2 flex-wrap">
          <Link to="/mypage" className="btn btn-primary">
            マイページへ
          </Link>
          {from === "ppv" && postId ? (
            <Link to={`/posts/${postId}`} className="btn btn-outline">
              購入した投稿へ
            </Link>
          ) : null}
          <Link to="/" className="btn btn-outline">
            トップへ
          </Link>
        </div>

        {summary && (
          <div className="pt-2">
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => setShowDebug((v) => !v)}
            >
              {showDebug ? "デバッグを閉じる" : "デバッグ表示"}
            </button>

            {showDebug && (
              <pre
                className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto"
                style={{ maxHeight: 260, wordBreak: "break-word", whiteSpace: "pre-wrap" }}
              >
                {JSON.stringify(summary, null, 2)}
              </pre>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
