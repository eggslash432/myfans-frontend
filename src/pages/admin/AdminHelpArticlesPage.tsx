// front/src/pages/admin/AdminHelpArticlesPage.tsx
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminListHelpArticles,
  adminCreateHelpArticle,
  type HelpArticle,
} from "@/features/admin";

export default function AdminHelpArticlesPage() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<HelpArticle[]>({
    queryKey: ["admin_help_articles"],
    queryFn: adminListHelpArticles,
  });

  const create = useMutation({
    mutationFn: adminCreateHelpArticle,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin_help_articles"] });
    },
  });

  if (isLoading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">読み込みに失敗しました</div>;

  const items = data ?? [];
  const hasGuide = items.some((x) => x.slug === "guide");
  const hasFaq = items.some((x) => x.slug === "faq");

  return (
    <div className="page space-y-3 max-w-lg mx-auto">
      <h1 className="page-title">ヘルプ記事管理</h1>
      <p className="page-description">ご利用ガイド・FAQ を編集します。</p>

      {/* ✅ 初期データ作成（DBが空でも編集できるように） */}
      {(!hasGuide || !hasFaq) && (
        <div className="card space-y-2">
          {!hasGuide && (
            <button
              className="btn w-full"
              disabled={create.isPending}
              onClick={() =>
                create.mutate({
                  slug: "guide",
                  title: "ご利用ガイド",
                  body: "（ここにガイド本文を入力してください）",
                  category: "GUIDE",
                  order: 0,
                  isPublished: true,
                })
              }
            >
              ガイドを作成
            </button>
          )}

          {!hasFaq && (
            <button
              className="btn w-full"
              disabled={create.isPending}
              onClick={() =>
                create.mutate({
                  slug: "faq",
                  title: "よくある質問（FAQ）",
                  body: "（ここにFAQ本文を入力してください）",
                  category: "FAQ",
                  order: 0,
                  isPublished: true,
                })
              }
            >
              FAQを作成
            </button>
          )}

          {create.isError && (
            <div className="text-xs text-red-600">
              作成に失敗しました（slug重複や権限、APIパスを確認）
            </div>
          )}
        </div>
      )}

      {/* ✅ 一覧 */}
      {items.length === 0 ? (
        <div className="text-xs text-gray-500">記事がありません。上のボタンで作成してください。</div>
      ) : (
        items.map((a) => (
          <Link
            key={a.id}
            to={`/admin/help/articles/${a.id}`}
            className="card card-link"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">{a.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  slug: {a.slug} / {a.isPublished ? "公開" : "非公開"}
                </div>
              </div>
              <span className="text-lg text-gray-400">›</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
