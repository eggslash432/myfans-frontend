// front/src/pages/creators/CreatorPlansPage.tsx

import { useEffect, useState } from 'react';
import { 
  getMyPlans,
  reorderPlans, 
  deactivatePlan, 
  reactivatePlan,
  createPlan,
  updatePlan,
  getMe,
} from '../../lib/api';
import type { Plan, PlansResponse } from '../../shared/types';
import type { PlanModalMode, Role } from '../../shared/prisma-enums';

export default function CreatorPlansPage() {
  const [_, setData] = useState<PlansResponse | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [role, setRole] = useState<Role>('fan');

  // ▼ モーダル状態
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<PlanModalMode>('create');
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalErr, setModalErr] = useState('');

  async function loadPlans() {
    try {
      setLoading(true);
      setErr('');
      const me = await getMe(); // GET /auth/me（JWT必須）
      setRole(me.role);

      if (me.role !== 'creator') {
        // admin / fan はプラン管理できない → 403を出さずに終了
        setData(null);
        setPlans([]);
        setErr('このページはクリエイターのみ利用できます。');
        return;
      }

      const res = await getMyPlans(); // GET /plans/me
      setData(res);
      setPlans(res?.plans ?? []);
    } catch (e: any) {
      console.error('load my plans failed', e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        'プラン一覧の取得に失敗しました';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  const friendlyErr =
    err === 'creatorId is required'
      ? 'クリエイター登録または本人確認（KYC）が完了していないため、プラン情報を取得できません。'
      : err;

  // ====== 並び順 ↑↓ ======
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
      console.error('reorder failed', e);
      setPlans(before);
      alert('並び順の更新に失敗しました');
    }
  };

  // ====== モーダル開閉 ======
  const openCreateModal = () => {
    setModalMode('create');
    setTargetPlan(null);
    setPlanName('');
    setPlanPrice('');
    setModalErr('');
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setModalMode('edit');
    setTargetPlan(plan);
    setPlanName(plan.name ?? '');
    setPlanPrice(String(plan.priceJpy ?? ''));
    setModalErr('');
    setShowModal(true);
  };

  async function deactivate(id: string) {
    try {
      await deactivatePlan(id);
      await loadPlans();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? '停止に失敗しました');
    }
  }

  async function reactivate(id: string) {
    try {
      await reactivatePlan(id);
      await loadPlans();
    } catch (e: any) {
      alert(e?.response?.data?.message ?? '再開に失敗しました');
    }
  }


  // ====== 作成 / 更新 ======
  const handleSavePlan = async () => {
    if (!planName.trim()) {
      setModalErr('プラン名を入力してください');
      return;
    }
    const price = Number(planPrice);
    if (!Number.isFinite(price) || price < 100) {
      setModalErr('月額料金は100円以上の整数で入力してください');
      return;
    }

    try {
      setSaving(true);
      setModalErr('');

      if (modalMode === 'create') {
        await createPlan({
          name: planName.trim(),
          priceJpy: price,
        });
      } else if (modalMode === 'edit' && targetPlan) {
        await updatePlan(targetPlan.id, {
          name: planName.trim(),
          priceJpy: price,
        });
      }

      setShowModal(false);
      setPlanName('');
      setPlanPrice('');
      setTargetPlan(null);

      await loadPlans();
    } catch (e: any) {
      console.error('save plan failed', e);
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        'プランの保存に失敗しました';
      setModalErr(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page space-y-4">
      <h1 className="page-title">プラン設定</h1>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <div className="section-title">作成済みプラン</div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openCreateModal}
            disabled={role !== 'creator'}
          >
            新規プラン作成
          </button>
        </div>

        {loading && (
          <p className="text-sm text-gray-500">読み込み中...</p>
        )}
        {friendlyErr && (
          <p className="text-sm text-red-600 whitespace-pre-wrap">
            {friendlyErr}
          </p>
        )}

        {!loading && !friendlyErr && plans.length === 0 && (
          <p className="text-sm text-gray-500">まだプランがありません。</p>
        )}

        {!loading && !friendlyErr && plans.length > 0 && (
          <ul className="space-y-2 text-sm">
            {plans.map((p, idx) => (
              <li
                key={p.id}
                className="border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between bg-white"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {p.name || '無題プラン'}
                    {!p.isActive && (
                      <span className="ml-2 text-xs text-gray-400">
                        （停止中）
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    ¥{p.priceJpy?.toLocaleString() ?? '0'} / 月
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {/* 並び替え */}
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => movePlan(idx, -1)}
                    disabled={idx === 0}
                    title="上へ"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => movePlan(idx, 1)}
                    disabled={idx === plans.length - 1}
                    title="下へ"
                  >
                    ↓
                  </button>

                  {/* 編集ボタン */}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-pink-500"
                    onClick={() => openEditModal(p)}
                    disabled={role !== 'creator'}
                  >
                    編集
                  </button>

                  {/* 停止 / 再開 トグル */}
                  {p.isActive ? (
                    <button
                      className="btn btn-outline btn-xs text-gray-600"
                      onClick={() => deactivate(p.id)}
                      disabled={role !== 'creator'}
                    >
                      停止
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => reactivate(p.id)}
                      disabled={role !== 'creator'}
                    >
                      再開
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ▼ 新規／編集モーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => !saving && setShowModal(false)}
          />
          <div className="relative mx-auto my-24 w-full max-w-md rounded-xl bg-white shadow-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold">
              {modalMode === 'create' ? '新しいプランを作成' : 'プランを編集'}
            </h2>

            <div className="space-y-3">
              <div className="form-field">
                <label className="form-label">プラン名</label>
                <input
                  className="form-input"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="例：スタンダード"
                />
              </div>

              <div className="form-field">
                <label className="form-label">月額料金（円）</label>
                <input
                  type="number"
                  className="form-input"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  placeholder="例：800"
                  min={100}
                  step={100}
                />
              </div>

              {modalErr && (
                <p className="text-xs text-red-600 whitespace-pre-wrap">
                  {modalErr}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => !saving && setShowModal(false)}
                  disabled={saving}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSavePlan}
                  disabled={saving}
                >
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
