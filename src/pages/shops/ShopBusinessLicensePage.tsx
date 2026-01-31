// front/src/pages/shops/ShopBusinessLicensePage.tsx
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/axiosLike";

type ContextRes = {
  shopId: string;
  role: string;
  businessLicenseStatus: "pending" | "approved" | "rejected" | string;
};

function statusLabel(st?: string) {
  if (st === "approved") return "承認済み";
  if (st === "pending") return "審査中";
  if (st === "rejected") return "差戻し";
  if (!st) return "不明";
  return st;
}

export default function ShopBusinessLicensePage() {
  const [data, setData] = useState<ContextRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 最短：fileKey手入力
  const [fileKey, setFileKey] = useState("");
  const canSubmit = useMemo(() => fileKey.trim().length > 0, [fileKey]);

  const load = async () => {
    setErr(null);
    try {
      // ✅ status API ではなく context を使う
      const res = await apiGet<ContextRes>("/shops/me/context");
      setData(res.data);
    } catch (e: any) {
      setData(null);
      setErr(e?.message ?? "context fetch failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr(null);
    try {
      await apiPost("/shops/me/business-license", { fileKey: fileKey.trim() });
      setFileKey("");
      await load();
      alert("提出しました（審査待ち）");
    } catch (e: any) {
      setErr(e?.message ?? "submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>営業許可書の提出</h1>

      <p style={{ marginTop: 8, color: "#555" }}>
        売上・出金などの店舗機能は、営業許可書の確認が完了するまで利用できません。
      </p>

      {err && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: "#ffecec",
            color: "#b00020",
          }}
        >
          {err}
        </div>
      )}

      {!data ? (
        <div style={{ marginTop: 12 }}>読み込み中...</div>
      ) : (
        <div style={{ marginTop: 12, lineHeight: 1.9 }}>
          <div>
            <b>ShopId：</b> {data.shopId}
          </div>
          <div>
            <b>ステータス：</b> {statusLabel(data.businessLicenseStatus)}
          </div>

          {/* ✅ hasFile は最短では取れないので表示しない（必要ならAPI拡張） */}
          <hr style={{ margin: "16px 0" }} />

          <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>提出（最短：fileKey手入力）</div>
            <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
              ※ 本番はファイルアップロードUIに差し替え予定。今は疎通確認のため fileKey を入力して送信します。
            </div>

            <div style={{ marginTop: 10 }}>
              <input
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
                placeholder="例）uploads/licenses/xxx.pdf"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                onClick={onSubmit}
                disabled={!canSubmit || loading}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  cursor: !canSubmit || loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "送信中..." : "提出する"}
              </button>

              <button
                onClick={load}
                disabled={loading}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                状態を更新
              </button>
            </div>
          </div>

          <div style={{ marginTop: 14, color: "#666", fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>よくある状態</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>未提出：提出してください</li>
              <li>審査中：承認までお待ちください</li>
              <li>差戻し：修正して再提出してください</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
