// front/src/pages/creator/CreatorPayoutsPage/useCreatorPayouts.ts
import { useEffect, useMemo, useState } from "react";
import type { 
  CreatorMeResponse, 
  Payout 
} from "@/shared/types";
import { createStripeOnboardingLink, getCreatorMe, getCreatorPayoutBalance, listCreatorPayouts, requestCreatorPayout } from "../api";

export function useCreatorPayouts() {
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);
  const [creatorErr, setCreatorErr] = useState("");

  const [balance, setBalance] = useState<number | null>(null);
  const [items, setItems] = useState<Payout[]>([]);
  const [amount, setAmount] = useState("");

  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState("");

  const [loadingRequest, setLoadingRequest] = useState(false);
  const [busyOnboarding, setBusyOnboarding] = useState(false);

  const kycStatus = creator?.stripeKycStatus ?? "pending";
  const chargesEnabled = !!creator?.stripeChargesEnabled;
  const payoutsEnabled = !!creator?.stripePayoutsEnabled;
  const disabledReason = creator?.stripeKycDisabledReason ?? null;
  const fieldsDue = creator?.stripeKycFieldsDue ?? [];

  const isKycOk = useMemo(
    () => kycStatus === "approved" && payoutsEnabled,
    [kycStatus, payoutsEnabled],
  );

  const needsOnboarding = useMemo(
    () =>
      kycStatus !== "approved" ||
      !chargesEnabled ||
      !payoutsEnabled ||
      (fieldsDue?.length ?? 0) > 0,
    [kycStatus, chargesEnabled, payoutsEnabled, fieldsDue],
  );

  async function loadPayoutData() {
    try {
      setLoadingAll(true);
      setError("");

      const bal = await getCreatorPayoutBalance();
      setBalance(bal.balanceJpy);

      const payouts = await listCreatorPayouts();
      setItems(payouts ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message ?? e?.message ?? "読み込みに失敗しました");
    } finally {
      setLoadingAll(false);
    }
  }

  // 初期ロード：creator → KYC OKなら出金データも
  useEffect(() => {
    (async () => {
      try {
        const res = await getCreatorMe();
        setCreator(res);
        setCreatorErr("");

        const nextKycStatus = res.stripeKycStatus ?? "pending";
        const nextPayoutsEnabled = !!res.stripePayoutsEnabled;

        const ok = nextKycStatus === "approved" && nextPayoutsEnabled;
        if (ok) {
          await loadPayoutData();
        } else {
          setLoadingAll(false); // 下のUIはKYCカードだけでOK
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startOrResumeKyc() {
    setBusyOnboarding(true);
    try {
      const { url } = await createStripeOnboardingLink();
      if (!url) throw new Error("Stripe onboarding URL が取得できませんでした");
      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? e?.message ?? "本人確認リンクの生成に失敗しました");
    } finally {
      setBusyOnboarding(false);
    }
  }

  async function requestPayout() {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert("正しい金額を入力してください");
      return;
    }

    setLoadingRequest(true);
    try {
      await requestCreatorPayout(num);
      alert("出金リクエストを送信しました");
      setAmount("");
      await loadPayoutData();
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "出金リクエストに失敗しました";
      alert(msg);
    } finally {
      setLoadingRequest(false);
    }
  }

  return {
    // creator
    creator,
    creatorErr,

    // computed stripe/kyc
    kycStatus,
    chargesEnabled,
    payoutsEnabled,
    disabledReason,
    fieldsDue,
    isKycOk,
    needsOnboarding,

    // payouts data
    balance,
    items,
    amount,

    // ui flags
    loadingAll,
    error,
    loadingRequest,
    busyOnboarding,

    // actions
    setAmount,
    loadPayoutData,
    startOrResumeKyc,
    requestPayout,
  };
}
