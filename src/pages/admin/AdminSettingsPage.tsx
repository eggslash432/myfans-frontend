// front/src/pages/admin/AdminSettingsPage.tsx

import { useState } from "react";
import {
  adminUpdateAdminRole,
  adminUpdateFeeSettings,
  adminUpdateUploadSettings,
} from "@/lib/api";

import { AdminRoleSection } from "./components/AdminRoleSection";
import { FeeSettingsSection } from "./components/FeeSettingsSection";
import { UploadSettingsSection } from "./components/UploadSettingsSection";
import { 
  useAdminSettingsData, 
  useAuth 
} from "@/hooks";

export function AdminSettingsPage() {
  const { user } = useAuth();

  const {
    loading,
    error,
    setError,
    feeSettings,
    setFeeSettings,
    uploadSettings,
    setUploadSettings,
    admins,
    setAdmins,
  } = useAdminSettingsData();

  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMessage, setFeeMessage] = useState<string | null>(null);

  const [adminsSaving, setAdminsSaving] = useState(false);

  const [uploadSaving, setUploadSaving] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const handleSaveFees = async () => {
    try {
      setFeeSaving(true);
      setFeeMessage(null);
      await adminUpdateFeeSettings(feeSettings);
      setFeeMessage("手数料設定を保存しました。");
    } catch (e: any) {
      console.error(e);
      setFeeMessage(e?.message ?? "手数料の保存に失敗しました。もう一度お試しください。");
    } finally {
      setFeeSaving(false);
    }
  };

  const handleSaveAdmins = async () => {
    try {
      setAdminsSaving(true);
      setError(null);

      // 自分自身はサーバーに投げない（API側でもガードするけど二重で安全）
      await Promise.all(
        admins.map((u) =>
          u.id === user?.id ? Promise.resolve() : adminUpdateAdminRole(u.id, u.role),
        ),
      );
    } catch (e) {
      console.error(e);
      setError("管理者権限の保存に失敗しました。");
    } finally {
      setAdminsSaving(false);
    }
  };

  const handleSaveUploadSettings = async () => {
    try {
      setUploadSaving(true);
      setUploadMessage(null);
      await adminUpdateUploadSettings(uploadSettings);
      setUploadMessage("アップロード制限を保存しました。");
    } catch (e: any) {
      console.error(e);
      setUploadMessage(e?.message ?? "アップロード制限の保存に失敗しました。");
    } finally {
      setUploadSaving(false);
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

        <AdminRoleSection
          currentUserId={user?.id ?? null}
          admins={admins}
          setAdmins={setAdmins}
          onSave={handleSaveAdmins}
          saving={adminsSaving}
        />

        <FeeSettingsSection
          feeSettings={feeSettings}
          setFeeSettings={setFeeSettings}
          onSave={handleSaveFees}
          saving={feeSaving}
          message={feeMessage}
          setMessage={setFeeMessage}
        />

        <UploadSettingsSection
          uploadSettings={uploadSettings}
          setUploadSettings={setUploadSettings}
          onSave={handleSaveUploadSettings}
          saving={uploadSaving}
          message={uploadMessage}
          setMessage={setUploadMessage}
        />
      </div>
    </div>
  );
}
