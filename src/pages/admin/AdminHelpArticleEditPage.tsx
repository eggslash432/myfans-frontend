// front/src/pages/admin/AdminHelpArticleEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListHelpArticles, adminUpdateHelpArticle, type HelpArticle } from "@/features/admin";

export default function AdminHelpArticleEditPage() {
  const params = useParams();
  const idParam = (params as { id?: string }).id;

  const nav = useNavigate();
  const qc = useQueryClient();

  if (!idParam) {
    return <div className="page">idがありません</div>;
  }
  const id: string = idParam;

  const { data, isLoading, error } = useQuery<HelpArticle[]>({
    queryKey: ["admin_help_articles"],
    queryFn: adminListHelpArticles,
  });

  const item = (data ?? []).find((x) => x.id === id) ?? null;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setBody(item.body ?? "");
    setIsPublished(item.isPublished);
  }, [item?.id]);

  if (isLoading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">読み込みに失敗しました</div>;
  if (!item) return <div className="page">記事が見つかりません</div>;

  async function onSave() {
    setSaving(true);
    try {
      await adminUpdateHelpArticle(id, { title, body, isPublished });
      await qc.invalidateQueries({ queryKey: ["admin_help_articles"] });
      nav("/admin/help/articles");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page space-y-3">
      <h1 className="page-title">記事編集</h1>
      <p className="page-description">slug: {item.slug}</p>

      <div className="card space-y-3">
        {/* タイトル */}
        <div className="form-field">
          <label className="form-label">タイトル</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）ご利用ガイド"
          />
        </div>

        {/* 本文 */}
        <div className="form-field">
          <label className="form-label">本文</label>
          <textarea
            className="form-input"
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="本文を入力してください"
            style={{ resize: "vertical", minHeight: 220 }}
          />
        </div>

        {/* 公開 */}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4b5563" }}>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          公開する
        </label>

        {/* 保存 */}
        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "保存中..." : "保存"}
        </button>

        {/* 戻る（任意） */}
        <button
          className="btn btn-outline"
          style={{ width: "100%" }}
          disabled={saving}
          onClick={() => nav("/admin/help/articles")}
        >
          戻る
        </button>
      </div>
    </div>
  );
}
