// front/src/pages/shop/ShopCreatePage.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import { createShop } from "../../lib/api/shop";
import { ApiError } from "../../lib/api/apiClient";

function getErrMsg(e: unknown) {
  if (!e) return "";
  if (e instanceof ApiError) return String(e.body?.message ?? e.message ?? "");
  if (e instanceof Error) return e.message;
  return String(e);
}

export default function ShopCreatePage() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  return (
    <ProtectedRoute roles={["shop_admin", "shop_staff"]}>
      <div className="page">
        <h1 className="page-title">Shop作成</h1>

        <div className="card">
          <div className="section-subtitle">Shop名</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：テストshop"
            style={{ width: "100%", marginTop: 8 }}
          />

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn"
              disabled={submitting || !name.trim()}
              onClick={async () => {
                setSubmitting(true);
                setMsg(null);
                setErr(null);
                try {
                  const res = await createShop(name.trim());
                  // 既に所属済みの場合もOK扱い
                  setMsg(res?.already ? "すでにShopに所属済みです" : "Shopを作成しました！");
                  // 少し待たずに即遷移でOK
                  nav("/shop");
                } catch (e) {
                  setErr(getErrMsg(e) || "作成に失敗しました");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "作成中…" : "作成する"}
            </button>

            <Link className="btn" to="/shop">
              戻る
            </Link>
          </div>

          {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
          {err && (
            <div style={{ marginTop: 10, color: "#ef4444", fontWeight: 700 }}>
              {err}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
