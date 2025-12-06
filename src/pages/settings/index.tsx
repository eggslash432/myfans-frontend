// front/src/pages/settings/index.tsx
import { Link } from "react-router-dom";

export default function SettingsHomePage() {
  return (
    <div className="settings-page">
      <h1 className="settings-title">設定</h1>

      <div className="settings-card">
        <Link to="/settings/password" className="settings-item">
          <div className="settings-item-main">
            <span className="settings-item-title">パスワード変更</span>
            <span className="settings-item-sub">
              ログイン用のパスワードを変更します
            </span>
          </div>
          <span className="settings-item-arrow">›</span>
        </Link>

        {/* 今後ここに項目を増やせる */}
        {/* <Link to="/settings/profile" className="settings-item"> ... </Link> */}
      </div>
    </div>
  );
}
