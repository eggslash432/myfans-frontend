// front/src/pages/creator/CreatorPayoutsPage/index.tsx
import { useMemo } from "react";
import { useCreatorPayouts } from "./useCreatorPayouts";
import { isCreatorNotFoundError } from "./payouts.types";
import { CreatorKycCard } from "./CreatorKycCard";
import { PayoutBalanceCard } from "./PayoutBalanceCard";
import { PayoutRequestForm } from "./PayoutRequestForm";
import { PayoutHistoryTable } from "./PayoutHistoryTable";

export default function PayoutsPage() {
  const vm = useCreatorPayouts();

  const creatorNotFound = useMemo(
    () => isCreatorNotFoundError(vm.creatorErr),
    [vm.creatorErr],
  );

  if (creatorNotFound) {
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

  if (vm.creatorErr && !vm.creator) {
    return (
      <div className="page">
        <h1 className="page-title">出金管理</h1>
        <section className="card">
          <p className="text-sm text-red-600 whitespace-pre-wrap">{vm.creatorErr}</p>
        </section>
      </div>
    );
  }

  if (!vm.creator) {
    return (
      <div className="page">
        <div className="p-4 text-sm text-gray-500">読み込み中…</div>
      </div>
    );
  }

  return (
    <div className="page space-y-4">
      <h1 className="page-title">出金管理</h1>

      <CreatorKycCard
        kycStatus={vm.kycStatus}
        chargesEnabled={vm.chargesEnabled}
        payoutsEnabled={vm.payoutsEnabled}
        disabledReason={vm.disabledReason}
        fieldsDue={vm.fieldsDue}
        needsOnboarding={vm.needsOnboarding}
        busyOnboarding={vm.busyOnboarding}
        onStartOrResume={vm.startOrResumeKyc}
      />

      {!vm.isKycOk ? (
        <section className="card">
          <p className="text-sm text-gray-700">
            本人確認（KYC）と Stripe 側の設定が完了すると、出金機能を利用できます。
          </p>
        </section>
      ) : (
        <>
          {vm.error && <div className="text-red-600 text-sm">{vm.error}</div>}

          <PayoutBalanceCard balance={vm.balance} />

          <PayoutRequestForm
            amount={vm.amount}
            loading={vm.loadingRequest}
            onChangeAmount={vm.setAmount}
            onSubmit={vm.requestPayout}
          />

          <PayoutHistoryTable items={vm.items} loading={vm.loadingAll} />
        </>
      )}
    </div>
  );
}
