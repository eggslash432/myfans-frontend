// front/src/pages/admin/components/AdminRoleSection.tsx

import type { AdminUser } from "../../../shared/types";

export function AdminRoleSection(props: {
  currentUserId?: string | null;
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  onSave: () => Promise<void>;
  saving: boolean;
}) {
  const { currentUserId, admins, setAdmins, onSave, saving } = props;

  const handleRoleChange = (userId: string, role: "admin" | "sub_admin") => {
    setAdmins((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  return (
    <section className="settings-card" style={{ marginBottom: 16 }}>
      <div className="settings-item-main">
        <div className="settings-item-title">管理者／一般管理者の権限区分</div>
        <div className="settings-item-sub">
          「管理者」はシステム全体の設定変更・手数料設定の編集ができます。
          「一般管理者」はユーザー／投稿／通報などの運用のみ行えます。
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-gray-500 mb-1">管理者アカウント一覧</div>

        <div className="settings-form" style={{ marginTop: 4 }}>
          {admins.length === 0 ? (
            <div className="text-xs text-gray-500">
              管理者アカウントが登録されていません。
            </div>
          ) : (
            <div className="space-y-2">
              {admins.map((a) => {
                const isSelf = !!currentUserId && a.id === currentUserId;

                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {a.name || a.email}
                        {isSelf ? "（あなた）" : ""}
                      </span>
                      <span className="text-xs text-gray-500">{a.email}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`role-${a.id}`}
                          checked={a.role === "admin"}
                          disabled={isSelf}
                          onChange={() => !isSelf && handleRoleChange(a.id, "admin")}
                        />
                        <span>管理者</span>
                      </label>

                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`role-${a.id}`}
                          checked={a.role === "sub_admin"}
                          disabled={isSelf}
                          onChange={() =>
                            !isSelf && handleRoleChange(a.id, "sub_admin")
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
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "保存中…" : "権限区分を保存"}
          </button>
        </div>
      </div>
    </section>
  );
}
