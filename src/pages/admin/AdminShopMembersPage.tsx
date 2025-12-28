// front/src/pages/admin/AdminShopMembersPage.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListShops,
  adminGetShopMembers,
  adminUpsertShopMember,
  adminDeleteShopMember,
  adminRestoreShopOwner,
  adminSearchUsers,
} from "@/lib/api/admin";
import type { SelectedUser, ShopRole } from "@/shared";



export function AdminShopMembersPage() {
  const qc = useQueryClient();

  // ----------------------------
  // Shop 選択
  // ----------------------------
  const [shopQuery, setShopQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string>("");

  const shopsQ = useQuery({
    queryKey: ["adminShops", shopQuery],
    queryFn: () => adminListShops({ q: shopQuery, take: 50 }),
  });

  const selectedShop = useMemo(() => {
    return shopsQ.data?.items?.find((s: any) => s.id === selectedShopId) ?? null;
  }, [shopsQ.data, selectedShopId]);

  // ----------------------------
  // Member 一覧
  // ----------------------------
  const membersQ = useQuery({
    queryKey: ["adminShopMembers", selectedShopId],
    queryFn: () => adminGetShopMembers(selectedShopId),
    enabled: !!selectedShopId,
  });

  // ----------------------------
  // ユーザー検索 → 選択
  // ----------------------------
  const [userQuery, setUserQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [role, setRole] = useState<ShopRole>("staff");

  const usersQ = useQuery({
    queryKey: ["adminUserSearch", userQuery],
    queryFn: () => adminSearchUsers({ q: userQuery, take: 20 }),
    enabled: userQuery.trim().length >= 2, // 2文字以上で検索
  });

  const upsertM = useMutation({
    mutationFn: async () => {
      if (!selectedShopId) throw new Error("Shopを選択してください");
      if (!selectedUser?.id) throw new Error("ユーザーを選択してください");
      return adminUpsertShopMember(selectedShopId, {
        userId: selectedUser.id,
        role,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adminShopMembers", selectedShopId] });
      await qc.invalidateQueries({ queryKey: ["adminShops"] });
    },
  });

  const deleteM = useMutation({
    mutationFn: async (userId: string) => {
      if (!selectedShopId) throw new Error("Shopを選択してください");
      return adminDeleteShopMember(selectedShopId, userId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adminShopMembers", selectedShopId] });
      await qc.invalidateQueries({ queryKey: ["adminShops"] });
    },
  });

  const restoreOwnerM = useMutation({
    mutationFn: async () => {
      if (!selectedShopId) throw new Error("Shopを選択してください");
      // body省略＝自分をownerにする（サーバー側で req.user から拾う）
      return adminRestoreShopOwner(selectedShopId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["adminShopMembers", selectedShopId] });
      await qc.invalidateQueries({ queryKey: ["adminShops"] });
    },
  });

  return (
    <div className="page">
      <div className="settings-page">
        <h1 className="settings-title">Shopメンバー管理</h1>
        <p className="page-description">
          Shop を選んで、ユーザー検索 → role付与/変更、members確認、owner復旧ができます。
        </p>

        {/* =========================
            1) Shop選択
           ========================= */}
        <section className="card space-y-3">
          <div className="section-title">1) Shopを選ぶ</div>

          <div>
            <div className="section-subtitle">Shop検索（名前）</div>
            <input
              className="input w-full"
              value={shopQuery}
              onChange={(e) => setShopQuery(e.target.value)}
              placeholder="例: Himefan / テスト / など"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          {shopsQ.isLoading && (
            <div className="text-xs text-gray-500">Shopを読み込み中...</div>
          )}
          {shopsQ.error && (
            <div className="text-xs text-red-600">
              Shop一覧の取得に失敗しました: {String((shopsQ.error as any)?.message ?? shopsQ.error)}
            </div>
          )}

          <div className="space-y-2">
            {(shopsQ.data?.items ?? []).map((s: any) => {
              const active = s.id === selectedShopId;
              return (
                <button
                  key={s.id}
                  className={"card card-link w-full text-left " + (active ? "ring-2 ring-black/20" : "")}
                  onClick={() => setSelectedShopId(s.id)}
                  type="button"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        id: <code>{s.id}</code>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        owner: {s.ownerEmail ?? "（なし）"} / members: {s.membersCount}
                      </div>
                    </div>
                    <span className="text-lg text-gray-400">›</span>
                  </div>
                </button>
              );
            })}
            {!shopsQ.isLoading && (shopsQ.data?.items?.length ?? 0) === 0 && (
              <div className="text-xs text-gray-500">該当するShopがありません</div>
            )}
          </div>

          {selectedShopId && (
            <div className="pt-2">
              <button
                className="btn w-full"
                disabled={restoreOwnerM.isPending}
                onClick={() => restoreOwnerM.mutate()}
              >
                {restoreOwnerM.isPending ? "復旧中..." : "自分を owner に戻す（緊急）"}
              </button>
              {restoreOwnerM.error && (
                <div className="text-xs text-red-600 mt-2">
                  失敗: {String((restoreOwnerM.error as any)?.message ?? restoreOwnerM.error)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* =========================
            2) ユーザー検索→付与
           ========================= */}
        <section className="card space-y-3">
          <div className="section-title">2) ユーザー検索 → role付与</div>

          {!selectedShopId && (
            <div className="text-xs text-gray-500">
              先にShopを選択してください。
            </div>
          )}

          <div>
            <div className="section-subtitle">ユーザー検索（email / 表示名）</div>
            <input
              className="input w-full"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="例: taro / example.com / たまご など（2文字以上）"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={!selectedShopId}
            />
          </div>

          {usersQ.isFetching && (
            <div className="text-xs text-gray-500">検索中...</div>
          )}
          {usersQ.error && (
            <div className="text-xs text-red-600">
              ユーザー検索に失敗しました: {String((usersQ.error as any)?.message ?? usersQ.error)}
            </div>
          )}

          {!!selectedShopId && userQuery.trim().length >= 2 && (
            <div className="space-y-2">
              {(usersQ.data?.items ?? []).map((u: any) => {
                const active = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    className={"card card-link w-full text-left " + (active ? "ring-2 ring-black/20" : "")}
                    onClick={() => setSelectedUser({ id: u.id, email: u.email, displayName: u.displayName })}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-semibold text-sm">
                          {u.displayName ?? "(no name)"}{" "}
                          <span className="text-xs text-gray-500 font-normal">{u.email}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          id: <code>{u.id}</code> / role: {u.role}
                        </div>
                      </div>
                      <span className="text-lg text-gray-400">›</span>
                    </div>
                  </button>
                );
              })}
              {(usersQ.data?.items?.length ?? 0) === 0 && (
                <div className="text-xs text-gray-500">該当ユーザーなし</div>
              )}
            </div>
          )}

          <div>
            <div className="section-subtitle">選択ユーザー</div>
            <div className="text-sm">
              {selectedUser ? (
                <>
                  <div>
                    <b>{selectedUser.displayName ?? "(no name)"}</b>{" "}
                    <span className="text-xs text-gray-500">{selectedUser.email}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    userId: <code>{selectedUser.id}</code>
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-500">未選択</span>
              )}
            </div>
          </div>

          <div>
            <div className="section-subtitle">付与するRole</div>
            <select
              className="input w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as ShopRole)}
              disabled={!selectedShopId}
            >
              <option value="owner">owner（オーナー）</option>
              <option value="admin">admin（管理）</option>
              <option value="staff">staff（スタッフ）</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              ※ owner は1人制：owner付与すると既存ownerはstaffに落ちます
            </div>
          </div>

          <button
            className="btn w-full"
            disabled={!selectedShopId || !selectedUser || upsertM.isPending}
            onClick={() => upsertM.mutate()}
          >
            {upsertM.isPending ? "実行中..." : "追加 / 更新"}
          </button>

          {upsertM.error && (
            <div className="text-xs text-red-600">
              失敗: {String((upsertM.error as any)?.message ?? upsertM.error)}
            </div>
          )}
          {upsertM.isSuccess && (
            <div className="text-xs text-green-700">OK: 反映しました</div>
          )}
        </section>

        {/* =========================
            3) 現在のmembers
           ========================= */}
        <section className="card space-y-3">
          <div className="section-title">3) 現在のメンバー</div>

          {!selectedShopId && (
            <div className="text-xs text-gray-500">Shopを選択してください。</div>
          )}

          {selectedShopId && membersQ.isLoading && (
            <div className="text-xs text-gray-500">membersを読み込み中...</div>
          )}
          {selectedShopId && membersQ.error && (
            <div className="text-xs text-red-600">
              members取得に失敗: {String((membersQ.error as any)?.message ?? membersQ.error)}
            </div>
          )}

          {selectedShopId && membersQ.data && (
            <div className="space-y-2">
              {(membersQ.data.items ?? []).map((m: any) => (
                <div key={m.userId} className="card">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold text-sm">
                        {m.displayName ?? "(no name)"}{" "}
                        <span className="text-xs text-gray-500 font-normal">{m.email}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        role: <b>{m.role}</b> / userId: <code>{m.userId}</code>
                      </div>
                    </div>

                    <button
                      className="btn"
                      style={{ padding: "8px 10px", fontSize: 12 }}
                      onClick={() => {
                        if (confirm("このメンバーを削除しますか？")) {
                          deleteM.mutate(m.userId);
                        }
                      }}
                      disabled={deleteM.isPending}
                      type="button"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
              {(membersQ.data.items?.length ?? 0) === 0 && (
                <div className="text-xs text-gray-500">membersがいません</div>
              )}
            </div>
          )}
        </section>

        {/* footer */}
        {selectedShop && (
          <div className="text-xs text-gray-500 mt-4">
            選択中Shop: <b>{selectedShop.name}</b>（<code>{selectedShop.id}</code>）
          </div>
        )}
      </div>
    </div>
  );
}
