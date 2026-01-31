// front/src/pages/public/GuidePage.tsx
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/axiosLike";

type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  order: number;
  updatedAt: string;
};

export default function GuidePage() {
  const [page, setPage] = useState<HelpArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<HelpArticle>("/help/articles/guide")
      .then((res) => setPage(res.data))
      .catch((e) => setError(e?.message ?? "failed"));
  }, []);

  if (error) return <div style={{ padding: 24 }}>読み込みに失敗しました: {error}</div>;
  if (!page) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>{page.title}</h1>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{page.body}</div>
    </div>
  );
}
