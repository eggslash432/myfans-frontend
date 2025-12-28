// front/src/pages/creators/CreatorPlansPage/useCreatorPlans.ts
import { useEffect, useMemo, useState } from "react";
import {
  getMyPlans,
  reorderPlans,
  deactivatePlan,
  reactivatePlan,
  createPlan,
  updatePlan,
  getCreatorMe,
} from "@/lib/api";

import { 
  type Plan, 
  type PlansResponse, 
  type CreatorMeResponse,
  type PlanModalMode,
  unwrapCreator,
} from "@/shared";

export function useCreatorPlans() {
  const [data, setData] = useState<PlansResponse | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // creator state
  const [creator, setCreator] = useState<CreatorMeResponse | null>(null);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<PlanModalMode>("create");
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState("");

  const isCreatorApproved = useMemo(
    () => creator?.approvalStatus === "approved",
    [creator],
  );

  async function loadPlans() {
    try {
      setLoading(true);
      setErr("");
      setModalErr("");

      // まず creator 状態を取得
      let c: CreatorMeResponse | null = null;
      try {
        const cres = await getCreatorMe();
        c = unwrapCreator(cres);
      } catch {
        c = null; // 404などは未申請扱い
      }
      setCreator(c);

      if (!c || c.approvalStatus !== "approved") {
        setData(null);
        setPlans([]);
        setErr("このページは承認済みクリエイターのみ利用できます。");
        return;
      }

      // 承認済みならプラン取得
      const res = await getMyPlans();
      setData(res);
      setPlans(res?.plans ?? []);
    } catch (e: any) {
      console.error("load my plans failed", e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "プラン一覧の取得に失敗しました";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 並び替え
  const movePlan = async (index: number, delta: number) => {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= plans.length) return;

    const before = [...plans];
    const after = [...plans];
    [after[index], after[newIndex]] = [after[newIndex], after[index]];
    setPlans(after);

    try {
      await reorderPlans(after.map((p) => p.id));
    } catch (e) {
      console.error("reorder failed", e);
      setPlans(before);
      alert("並び順の更新に失敗しました");
    }
  };

  // modal open/close
  const openCreateModal = () => {
    setModalMode("create");
    setTargetPlan(null);
    setPlanName("");
    setPlanPrice("");
    setModalErr("");
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setModalMode("edit");
    setTargetPlan(plan);
    setPlanName(plan.name ?? "");
    setPlanPrice(String(plan.priceJpy ?? ""));
    setModalErr("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  async function deactivate(id: string) {
    try {
      await deactivatePlan(id);
      await loadPlans();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "停止に失敗しました");
    }
  }

  async function reactivate(id: string) {
    try {
      await reactivatePlan(id);
      await loadPlans();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "再開に失敗しました");
    }
  }

  const savePlan = async () => {
    if (!isCreatorApproved) {
      setModalErr("承認済みクリエイターのみ操作できます。");
      return;
    }
    if (!planName.trim()) {
      setModalErr("プラン名を入力してください");
      return;
    }
    const price = Number(planPrice);
    if (!Number.isFinite(price) || price < 100) {
      setModalErr("月額料金は100円以上の整数で入力してください");
      return;
    }

    try {
      setSaving(true);
      setModalErr("");

      if (modalMode === "create") {
        await createPlan({ name: planName.trim(), priceJpy: price });
      } else if (modalMode === "edit" && targetPlan) {
        await updatePlan(targetPlan.id, { name: planName.trim(), priceJpy: price });
      }

      setShowModal(false);
      setPlanName("");
      setPlanPrice("");
      setTargetPlan(null);

      await loadPlans();
    } catch (e: any) {
      console.error("save plan failed", e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "プランの保存に失敗しました";
      setModalErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    // view state
    data,
    plans,
    loading,
    err,
    creator,
    isCreatorApproved,

    // list actions
    loadPlans,
    movePlan,
    deactivate,
    reactivate,

    // modal state/actions
    showModal,
    modalMode,
    targetPlan,
    planName,
    planPrice,
    saving,
    modalErr,

    openCreateModal,
    openEditModal,
    closeModal,
    setPlanName,
    setPlanPrice,
    savePlan,
  };
}
