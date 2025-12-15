// front/src/pages/settings/PasswordChangePage.tsx
import { useState } from "react";
import { ApiError } from "../../lib/api/apiClient";
import { changePassword } from "../../lib/api/auth";

export default function PasswordChangePage() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      await changePassword({ oldPassword, newPassword });

      setIsError(false);
      setMessage("パスワードが変更されました");
      setOld("");
      setNew("");
    } catch (err: any) {
      setIsError(true);

      if (err instanceof ApiError) {
        setMessage(
          err.body?.message ?? err.message ?? "パスワード変更に失敗しました",
        );
      } else {
        setMessage("予期せぬエラーが発生しました");
      }
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">パスワード変更</h1>

      <form onSubmit={onSubmit} className="settings-form">
        <div className="settings-form-group">
          <label className="settings-form-label">現在のパスワード</label>
          <input
            type="password"
            placeholder="現在のパスワード"
            value={oldPassword}
            onChange={(e) => setOld(e.target.value)}
            className="settings-form-input"
          />
        </div>

        <div className="settings-form-group">
          <label className="settings-form-label">新しいパスワード</label>
          <input
            type="password"
            placeholder="新しいパスワード"
            value={newPassword}
            onChange={(e) => setNew(e.target.value)}
            className="settings-form-input"
          />
        </div>

        {message && (
          <p
            className={
              "settings-message " +
              (isError ? "settings-message-error" : "settings-message-success")
            }
          >
            {message}
          </p>
        )}

        <button type="submit" className="settings-form-submit">
          変更する
        </button>
      </form>
    </div>
  );
}
