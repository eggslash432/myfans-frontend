// front/src/pages/admin/AdminSettingsPage.tsx

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import type { AdminUser, FeeSettings } from '../../shared/types';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    managerPercent: 20,
    shopPercent: 10,
    creatorPercent: 70,
  });
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMessage, setFeeMessage] = useState<string | null>(null);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsSaving, setAdminsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPercent =
    feeSettings.managerPercent +
    feeSettings.shopPercent +
    feeSettings.creatorPercent;

  const isFeeValid = totalPercent === 100;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [feeRes, adminList] = await Promise.all([
          api.getFeeSettings(),
          api.listAdminUsers(),
        ]);

        setFeeSettings({
          managerPercent: feeRes.managerPercent,
          shopPercent: feeRes.shopPercent,
          creatorPercent: feeRes.creatorPercent,
        });

        setAdmins(adminList);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message ??
            '設定情報の取得に失敗しました。管理者にお問い合わせください。',
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFeeChange = (key: keyof FeeSettings, value: string) => {
    const n = Number(value);
    setFeeSettings((prev) => ({
      ...prev,
      [key]: Number.isFinite(n) ? n : 0,
    }));
  };

  const handleSaveFees = async () => {
    if (!isFeeValid) {
      setFeeMessage('合計が 100% になるように設定してください。');
      return;
    }
    try {
      setFeeSaving(true);
      setFeeMessage(null);
      await api.updateFeeSettings(feeSettings);
      setFeeMessage('手数料設定を保存しました。');
    } catch (e: any) {
      console.error(e);
      setFeeMessage(
        e?.message ?? '手数料の保存に失敗しました。もう一度お試しください。',
      );
    } finally {
      setFeeSaving(false);
    }
  };

  const handleRoleChange = (userId: string, role: 'admin' | 'sub_admin') => {
    setAdmins((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u)),
    );
  };

  const handleSaveAdmins = async () => {
    try {
      setAdminsSaving(true);
      // 自分自身はサーバーに投げない（API 側でもガードするけど二重で安全）
      await Promise.all(
        admins.map((u) =>
          u.id === user?.id
            ? Promise.resolve()
            : api.updateAdminRole(u.id, u.role),
        ),
      );
    } catch (e) {
      console.error(e);
      setError('管理者権限の保存に失敗しました。');
    } finally {
      setAdminsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">設定情報を読み込み中です…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="card">
          <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="settings-page">
        <h1 className="settings-title">システム設定</h1>

        {/* ① 管理者／一般管理者の権限区分 */}
        <section className="settings-card" style={{ marginBottom: 16 }}>
          <div className="settings-item-main">
            <div className="settings-item-title">
              管理者／一般管理者の権限区分
            </div>
            <div className="settings-item-sub">
              「管理者」はシステム全体の設定変更・手数料設定の編集ができます。
              「一般管理者」はユーザー／投稿／通報などの運用のみ行えます。
            </div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">
              管理者アカウント一覧
            </div>
            <div className="settings-form" style={{ marginTop: 4 }}>
              {admins.length === 0 ? (
                <div className="text-xs text-gray-500">
                  管理者アカウントが登録されていません。
                </div>
              ) : (
                <div className="space-y-2">
                  {admins.map((a) => {
                    const isSelf = user && a.id === user.id;

                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium">
                            {a.name || a.email}
                            {isSelf ? '（あなた）' : ''}
                          </span>
                          <span className="text-xs text-gray-500">
                            {a.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`role-${a.id}`}
                              checked={a.role === 'admin'}
                              disabled={!!isSelf} // 自分は変更不可
                              onChange={() =>
                                !isSelf && handleRoleChange(a.id, 'admin')
                              }
                            />
                            <span>管理者</span>
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name={`role-${a.id}`}
                              checked={a.role === 'sub_admin'}
                              disabled={!!isSelf} // 自分は変更不可
                              onChange={() =>
                                !isSelf &&
                                handleRoleChange(a.id, 'sub_admin')
                              }
                            />
                            <span>一般管理者</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className="settings-form-submit"
                onClick={handleSaveAdmins}
                disabled={adminsSaving}
              >
                {adminsSaving ? '保存中…' : '権限区分を保存'}
              </button>
            </div>
          </div>
        </section>

        {/* ② 手数料設定 */}
        <section className="settings-card">
          <div className="settings-item-main">
            <div className="settings-item-title">手数料設定</div>
            <div className="settings-item-sub">
              売上の分配率を設定します。合計が 100% になるようにしてください。
            </div>
          </div>

          <form
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveFees();
            }}
          >
            <div className="settings-form-group">
              <label className="settings-form-label">
                管理者（プラットフォーム）の取り分（%）
              </label>
              <input
                type="number"
                className="settings-form-input"
                value={feeSettings.managerPercent}
                min={0}
                max={100}
                onChange={(e) =>
                  handleFeeChange('managerPercent', e.target.value)
                }
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label">
                店舗（仲介業者など）の取り分（%）
              </label>
              <input
                type="number"
                className="settings-form-input"
                value={feeSettings.shopPercent}
                min={0}
                max={100}
                onChange={(e) =>
                  handleFeeChange('shopPercent', e.target.value)
                }
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label">
                クリエイターの取り分（%）
              </label>
              <input
                type="number"
                className="settings-form-input"
                value={feeSettings.creatorPercent}
                min={0}
                max={100}
                onChange={(e) =>
                  handleFeeChange('creatorPercent', e.target.value)
                }
              />
            </div>

            <div className="text-xs mt-1">
              合計：{totalPercent}%
              {!isFeeValid && (
                <span className="text-red-600 ml-1">
                  （100% になるように調整してください）
                </span>
              )}
            </div>

            {feeMessage && (
              <div className="settings-message settings-message-success">
                {feeMessage}
              </div>
            )}

            <button
              type="submit"
              className="settings-form-submit"
              disabled={feeSaving || !isFeeValid}
            >
              {feeSaving ? '保存中…' : '手数料設定を保存'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
