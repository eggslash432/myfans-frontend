//front/src/pages/home/CampaignPage.tsx

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { type Announcement } from "@/shared";
import { excerpt } from "@/utils";

export function CampaignPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await apiGet<{ items: Announcement[] }>("/announcements/active");
        setItems(res.data.items ?? []);
      } catch (e) {
        console.error(e);
        setErr("告知の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasItems = useMemo(() => !loading && !err && items.length > 0, [loading, err, items.length]);

  return (
    <div className="page">
      <div className="card">
        <div className="section-title">キャンペーン告知</div>

        {loading ? (
          <div className="section-subtitle">読み込み中...</div>
        ) : err ? (
          <div className="auth-error">{err}</div>
        ) : items.length === 0 ? (
          <div className="section-subtitle">現在告知はありません。</div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <button
                key={a.id}
                className="card"
                style={{ width: "100%", textAlign: "left" }}
                onClick={() => setSelected(a)}
              >
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <div className="section-subtitle" style={{ marginTop: 6 }}>
                  {excerpt(a.body)}
                </div>

                <div className="section-subtitle" style={{ marginTop: 8 }}>
                  タップして詳細を見る
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {hasItems && selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-card2" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">キャンペーン告知</div>
              <button className="btn btn-sm btn-ghost" onClick={() => setSelected(null)}>
                閉じる
              </button>
            </div>

            <div className="modal-body">
              <div style={{ fontWeight: 900, fontSize: 16 }}>{selected.title}</div>

              {selected.bannerImageUrl && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={selected.bannerImageUrl}
                    alt={selected.title}
                    style={{ width: "100%", borderRadius: 12 }}
                  />
                </div>
              )}

              <div style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{selected.body}</div>

              {selected.linkUrl && (
                <div style={{ marginTop: 12 }}>
                  <a
                    className="btn btn-primary"
                    href={selected.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    詳細を見る
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
