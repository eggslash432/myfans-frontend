// front/src/pages/shops/ShopMembershipPage.tsx
import { useState } from "react";
import { ProtectedRoute } from "@/components";
import { 
  createShopInvite, 
  joinShopByCode 
} from "@/lib/api";

export function ShopMembershipPage() {
  const [invite, setInvite] = useState<string>("");
  const [created, setCreated] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <ProtectedRoute require="shop">
      <div className="page">
        <h1 className="page-title">Shop所属</h1>

        <div className="card">
          <div className="section-subtitle">招待コードで参加</div>
          <input
            value={invite}
            onChange={(e) => setInvite(e.target.value)}
            placeholder="招待コード"
            style={{ width: "100%", marginTop: 8 }}
          />
          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={async () => {
              setMsg(null);
              const res = await joinShopByCode(invite.trim());
              setMsg(res.already ? "すでに所属済みです" : "参加しました！");
              // 参加後は /shop に戻してOK（再取得させる）
              window.location.href = "/shops";
            }}
          >
            参加する
          </button>
          {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="section-subtitle">招待コードを発行（owner/admin）</div>
          <button
            className="btn"
            onClick={async () => {
              setMsg(null);
              const res = await createShopInvite({ role: "staff" });
              setCreated(res.code);
            }}
          >
            staff招待コードを作る
          </button>

          {created && (
            <div style={{ marginTop: 10 }}>
              <div>招待コード：</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{created}</div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
