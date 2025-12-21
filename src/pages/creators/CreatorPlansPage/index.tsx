// front/src/pages/creators/CreatorPlansPage/index.tsx
import { useMemo } from "react";
import { useCreatorPlans } from "./useCreatorPlans";
import { CreatorPlanList } from "./CreatorPlanList";
import { CreatorPlanModal } from "./CreatorPlanModal";
import { friendlyCreatorPlansError } from "./creatorPlans.types";

export default function CreatorPlansPage() {
  const vm = useCreatorPlans();

  const friendlyErr = useMemo(
    () => friendlyCreatorPlansError(vm.err),
    [vm.err],
  );

  return (
    <div className="page space-y-4">
      <h1 className="page-title">プラン設定</h1>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-title">作成済みプラン</div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={vm.openCreateModal}
            disabled={!vm.isCreatorApproved}
            title={!vm.isCreatorApproved ? "承認済みクリエイターのみ利用できます" : undefined}
          >
            新規プラン作成
          </button>
        </div>

        {vm.loading && <p className="text-sm text-gray-500">読み込み中...</p>}

        {friendlyErr && (
          <p className="text-sm text-red-600 whitespace-pre-wrap">{friendlyErr}</p>
        )}

        {!vm.loading && !friendlyErr && vm.plans.length === 0 && (
          <p className="text-sm text-gray-500">まだプランがありません。</p>
        )}

        {!vm.loading && !friendlyErr && vm.plans.length > 0 && (
          <CreatorPlanList
            plans={vm.plans}
            isCreatorApproved={vm.isCreatorApproved}
            onMove={vm.movePlan}
            onEdit={vm.openEditModal}
            onDeactivate={vm.deactivate}
            onReactivate={vm.reactivate}
          />
        )}
      </section>

      <CreatorPlanModal
        open={vm.showModal}
        mode={vm.modalMode}
        planName={vm.planName}
        planPrice={vm.planPrice}
        saving={vm.saving}
        error={vm.modalErr}
        isCreatorApproved={vm.isCreatorApproved}
        onClose={vm.closeModal}
        onChangeName={vm.setPlanName}
        onChangePrice={vm.setPlanPrice}
        onSave={vm.savePlan}
      />
    </div>
  );
}
