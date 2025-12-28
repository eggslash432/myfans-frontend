// front/src/pages/admin/AdminShopCreatePage.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ProtectedRoute } from "@/components";
import { 
  adminCreateShop,
  adminSearchUsers,
} from "@/lib/api";
import type { PickUser } from "@/shared";
import { getErrMsg } from "@/lib";
import { unwrapUserSearchItems } from "./domain/unwrap";


export function AdminShopCreatePage() {
  const [name, setName] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<PickUser | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nav = useNavigate();

  const q = userQuery.trim();
  const canSearch = q.length >= 2;

  const usersQ = useQuery({
    queryKey: ["admin_user_search", q],
    queryFn: async () => {
      // adminSearchUsers の引数形が違っても死なないように吸収
      // 1) adminSearchUsers({ q, take })
      // 2) adminSearchUsers(q)
      try {
        return await (adminSearchUsers as any)({ q, take: 20 });
      } catch {
        return await (adminSearchUsers as any)(q);
      }
    },
    enabled: canSearch,
    staleTime: 10_000,
  });

  const users = useMemo(() => unwrapUserSearchItems(usersQ.data), [usersQ.data]);

  const canSubmit = !submitting && !!name.trim();

  return (
    <ProtectedRoute require="admin">
      <div className="page">
        <h1 className="page-title">Shop作成（運営管理者）</h1>

        <div className="card">
          {/* ========== Shop名 ========== */}
          <div className="section-subtitle">Shop名</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：テストshop"
            style={{ width: "100%", marginTop: 8 }}
          />

          {/* ========== Owner選択 ========== */}
          <div className="section-subtitle" style={{ marginTop: 12 }}>
            Owner（任意）: ユーザー検索 → 選択
          </div>

          <input
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="メール / 表示名 で検索（2文字以上）"
            style={{ width: "100%", marginTop: 8 }}
          />

          <div style={{ marginTop: 8 }}>
            {!canSearch && (
              <div className="text-xs text-gray-500">
                2文字以上入力すると検索できます。
              </div>
            )}

            {usersQ.isFetching && canSearch && (
              <div className="text-xs text-gray-500">検索中...</div>
            )}

            {usersQ.isError && (
              <div className="text-xs text-red-600" style={{ whiteSpace: "pre-wrap" }}>
                検索に失敗しました：{getErrMsg((usersQ as any).error)}
              </div>
            )}

            {canSearch && !usersQ.isFetching && users.length === 0 && (
              <div className="text-xs text-gray-500">該当ユーザーが見つかりません。</div>
            )}
          </div>

          {users.length > 0 && (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {users.map((u) => {
                const active = selectedOwner?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    className="card"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: active ? "2px solid rgba(0,0,0,0.18)" : undefined,
                    }}
                    onClick={() => setSelectedOwner(u)}
                    title="クリックしてOwnerに選択"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>
                          {u.displayName ?? "(no name)"}{" "}
                          <span style={{ fontWeight: 500, opacity: 0.7, fontSize: 12 }}>
                            {u.email}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                          id: <code>{u.id}</code>
                          {u.role ? <> / role: {u.role}</> : null}
                        </div>
                      </div>
                      <span style={{ opacity: 0.45, fontSize: 18 }}>›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
            選択中：{" "}
            {selectedOwner ? (
              <>
                <b>{selectedOwner.displayName ?? "(no name)"}</b>（{selectedOwner.email}）
                <button
                  type="button"
                  className="btn"
                  style={{ marginLeft: 10, padding: "4px 10px" }}
                  onClick={() => setSelectedOwner(null)}
                >
                  解除
                </button>
              </>
            ) : (
              "なし"
            )}
          </div>

          {/* ========== Actions ========== */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn"
              disabled={!canSubmit}
              onClick={async () => {
                if (!canSubmit) return;

                setSubmitting(true);
                setErr(null);

                try {
                  const res = await adminCreateShop({
                    name: name.trim(),
                    ownerUserId: selectedOwner?.id ?? null,
                  });

                  // ひとまず復旧ページへ（存在しているルート）
                  nav("/admin/shops/members");

                  void res;
                } catch (e) {
                  setErr(getErrMsg(e) || "作成に失敗しました");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "作成中…" : "作成する"}
            </button>

            <Link className="btn" to="/admin">
              戻る
            </Link>
          </div>

          {err && (
            <div
              style={{
                marginTop: 10,
                color: "#ef4444",
                fontWeight: 700,
                whiteSpace: "pre-wrap",
              }}
            >
              {err}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
