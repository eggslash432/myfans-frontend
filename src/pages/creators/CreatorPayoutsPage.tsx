// front/src/pages/creator/CreatorPayoutsPage.tsx

// front/src/pages/creator/CreatorPayoutsPage.tsx

import { useEffect, useState } from "react";
import {
  getCreatorMe,
  getCreatorPayoutBalance,
  listCreatorPayouts,
  requestCreatorPayout,
  createStripeOnboardingLink, // ★追加（後述の API を creators.ts に追加）
} from "../../lib/api";
import type { CreatorMeResponse, Payout } from "../../shared/types";
import type { PayoutStatus } from "../../shared/prisma-enums";
import KycStatusBadge from "../../components/ui/KycStatusBadge"; // ★前に作った想定

export default function PayoutsPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [items, setItems] = useState<Payout[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState<string>("");
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [creatorErr, setCreatorErr] = useState("");
  const [busyOnboarding, setBusyOnboarding] = useState(false);

  // 出金情報読み込み
  async function loadAll() {
    try {
      setLoadingAll(true);
      setError("");

      const bal = await getCreatorPayoutBalance();
      setBalance(bal.balanceJpy);

      const payouts = await listCreatorPayouts();
      setItems(payouts ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "読み込みに失敗しました");
    } finally {
      setLoadingAll(false);
    }
  }

  // 初期ロード：creator → OKなら出金情報ロード
  useEffect(() => {
    (async () => {
      try {
        const res = await getCreatorMe();
        setCreator(res);
        setCreatorErr("");

        const kycStatus = res.stripeKycStatus ?? "pending";
        const payoutsEnabled = !!res.stripePayoutsEnabled;
        const chargesEnabled = !!res.stripeChargesEnabled;

        // ★ 出金機能が使える判定：KYC approved かつ payoutsEnabled
        const isKycOk = kycStatus === "approved" && payoutsEnabled;

        // KYC完了なら出金情報も読む
        if (isKycOk) {
          await loadAll();
        } else {
          setLoadingAll(false);
        }

        // balance/items は KYC完了まで空でもOK
      } catch (e: any) {
        console.error(e);
        setCreatorErr(
          e?.response?.data?.message ??
            e?.message ??
            "クリエイター情報の取得に失敗しました",
        );
        setLoadingAll(false);
      }
    })();
  }, []);

  // onboarding link へ飛ぶ
  async function handleStartOrResumeKyc() {
    setBusyOnboarding(true);
    try {
      const { url } = await createStripeOnboardingLink();
      if (!url) throw new Error("Stripe onboarding URL が取得できませんでした");
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "本人確認リンクの生成に失敗しました");
    } finally {
      setBusyOnboarding(false);
    }
  }

  async function handleRequest() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert("正しい金額を入力してください");
      return;
    }
    setLoading(true);
    try {
      await requestCreatorPayout(num);
      alert("出金リクエストを送信しました");
      setAmount("");
      await loadAll();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "出金リクエストに失敗しました";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  function renderStatusLabel(s: PayoutStatus) {
    switch (s) {
      case "requested":
        return "申請中";
      case "approved":
        return "承認済（振込待ち）";
      case "paid":
        return "振込済み";
      case "rejected":
        return "却下";
      default:
        return s;
    }
  }

  // クリエイター未登録
  if (creatorErr.toLowerCase().includes("creator not found")) {
    return (
      <div className="page">
        <h1 className="page-title">出金管理</h1>
        <section className="card">
          <p className="text-sm text-gray-700">
            出金機能を利用するには、まずクリエイター登録が必要です。
          </p>
        </section>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="page">
        <div className="p-4 text-sm text-gray-500">読み込み中…</div>
      </div>
    );
  }

  // KYC / Stripe ステータス
  const kycStatus = creator.stripeKycStatus ?? "pending";
  const chargesEnabled = !!creator.stripeChargesEnabled;
  const payoutsEnabled = !!creator.stripePayoutsEnabled;
  const disabledReason = creator.stripeKycDisabledReason ?? null;
  const fieldsDue = creator.stripeKycFieldsDue ?? [];

  // 出金可能判定
  const isKycOk = kycStatus === "approved" && payoutsEnabled;

  const needsOnboarding =
    kycStatus !== "approved" || !chargesEnabled || !payoutsEnabled || fieldsDue.length > 0;

  const onboardingLabel =
    kycStatus === "rejected"
      ? "本人確認を修正して再提出"
      : kycStatus === "pending"
      ? "本人確認の状況を確認・再開"
      : kycStatus === "approved"
      ? "Stripe設定を確認"
      : "本人確認を開始";

  const monetizationText =
    chargesEnabled && payoutsEnabled
      ? "収益化OK"
      : chargesEnabled && !payoutsEnabled
      ? "出金準備中"
      : !chargesEnabled && payoutsEnabled
      ? "決済準備中"
      : "収益化NG";

  const monetizationTone =
    chargesEnabled && payoutsEnabled
      ? "badge-green"
      : chargesEnabled || payoutsEnabled
      ? "badge-yellow"
      : "badge-red";

  // ★ KYC未完了でも、ここで “開始/再開ボタン” を見せる（これが今回の本題）
  return (
    <div className="page space-y-4">
      <h1 className="page-title">出金管理</h1>

      {/* ===== 本人確認（KYC）/ Stripe 状態 ===== */}
      <section className="card space-y-2">
        <div className="section-title">本人確認（Stripe）</div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">状態</span>
          <KycStatusBadge status={kycStatus} disabledReason={disabledReason} />
          <span className={`badge ${monetizationTone}`}>{monetizationText}</span>

          <span className="text-xs text-gray-400">
            決済:{chargesEnabled ? "有効" : "無効"} / 出金:{payoutsEnabled ? "有効" : "無効"}
          </span>
        </div>

        {fieldsDue.length > 0 && (
          <div className="text-xs text-gray-600">
            本人確認が未完了です（{fieldsDue.length}項目）
            <details className="mt-1">
              <summary className="cursor-pointer text-xs text-gray-500">
                未完了項目を表示
              </summary>
              <ul className="list-disc pl-5 mt-1">
                {fieldsDue.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {kycStatus === "rejected" && (
          <div className="text-xs text-red-600">
            否認されています。内容を修正して再提出してください。
            {disabledReason && (
              <div className="text-xs text-gray-500 mt-1">
                理由: {disabledReason}
              </div>
            )}
          </div>
        )}

        {needsOnboarding && (
          <button
            type="button"
            className="btn btn-primary w-full justify-center"
            disabled={busyOnboarding}
            onClick={handleStartOrResumeKyc}
          >
            {busyOnboarding ? "リンク作成中…" : onboardingLabel}
          </button>
        )}

        {!needsOnboarding && (
          <p className="text-xs text-gray-500">
            本人確認は完了しています。出金が可能です。
          </p>
        )}
      </section>

      {/* ===== ここから下は KYC OK のときだけ表示 ===== */}
      {!isKycOk ? (
        <section className="card">
          <p className="text-sm text-gray-700">
            本人確認（KYC）と Stripe 側の設定が完了すると、出金機能を利用できます。
          </p>
        </section>
      ) : (
        <>
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* 残高表示 */}
          <section className="card space-y-2">
            <div className="text-sm text-gray-600">出金可能残高</div>
            <div className="text-2xl font-semibold">
              {balance == null ? "読み込み中…" : `¥${balance.toLocaleString()}`}
            </div>
          </section>

          {/* 出金リクエストフォーム */}
          <section className="card space-y-3">
            <div className="section-title">出金リクエスト</div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="number"
                className="form-input w-40"
                placeholder="金額（円）"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={handleRequest}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                {loading ? "送信中…" : "出金申請する"}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              出金可能残高の範囲内で申請できます。
            </p>
          </section>

          {/* リスト */}
          <section className="card space-y-3">
            <div className="section-title">出金履歴</div>
            {loadingAll ? (
              <div className="text-sm text-gray-500">読み込み中…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-500">
                まだ出金リクエストはありません。
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">申請日</th>
                    <th className="text-right py-1">金額</th>
                    <th className="text-left py-1">ステータス</th>
                    <th className="text-left py-1">振込日</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-1">
                        {new Date(p.requestedAt).toLocaleString()}
                      </td>
                      <td className="py-1 text-right">
                        ¥{p.amountJpy.toLocaleString()}
                      </td>
                      <td className="py-1">{renderStatusLabel(p.payoutStatus)}</td>
                      <td className="py-1">
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
