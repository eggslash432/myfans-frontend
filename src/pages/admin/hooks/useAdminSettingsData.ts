// front/src/pages/admin/hooks/useAdminSettingsData.ts

import { useEffect, useState } from "react";
import {
  adminGetFeeSettings,
  adminGetUploadSettings,
  adminListAdminUsers,
} from "../../../lib/api/admin";
import type { AdminUser, FeeSettings, UploadSetting } from "../../../shared/types";

export function useAdminSettingsData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    managerPercent: 20,
    shopPercent: 10,
    creatorPercent: 70,
  });

  const [uploadSettings, setUploadSettings] = useState<UploadSetting>({
    maxFileSizeMb: 20,
    maxFiles: 10,
  });

  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [feeRes, adminList, uploadRes] = await Promise.all([
          adminGetFeeSettings(),
          adminListAdminUsers(),
          adminGetUploadSettings(),
        ]);

        setFeeSettings({
          managerPercent: feeRes.managerPercent,
          shopPercent: feeRes.shopPercent,
          creatorPercent: feeRes.creatorPercent,
        });

        setUploadSettings({
          maxFileSizeMb: uploadRes.maxFileSizeMb,
          maxFiles: uploadRes.maxFiles,
        });

        setAdmins(adminList);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message ??
            "設定情報の取得に失敗しました。管理者にお問い合わせください。",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    loading,
    error,
    setError,
    feeSettings,
    setFeeSettings,
    uploadSettings,
    setUploadSettings,
    admins,
    setAdmins,
  };
}
