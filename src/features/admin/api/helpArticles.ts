// front/src/features/admin/api/helpArticles.ts

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/axiosLike";

export type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  order: number;
  isPublished: boolean;
  updatedAt: string;
  createdAt: string;
};

export type CreateHelpArticleDto = {
  slug: string;
  title: string;
  body: string;
  category: string; // enumならその型に
  order?: number;
  isPublished?: boolean;
};

export type UpdateHelpArticleDto = Partial<CreateHelpArticleDto>;

export async function adminListHelpArticles() {
  const res = await apiGet<HelpArticle[]>("/admin/help/articles");
  return res.data;
}

export async function adminCreateHelpArticle(dto: CreateHelpArticleDto) {
  const res = await apiPost<HelpArticle>("/admin/help/articles", dto);
  return res.data;
}

export async function adminUpdateHelpArticle(id: string, dto: UpdateHelpArticleDto) {
  const res = await apiPatch<HelpArticle>(`/admin/help/articles/${id}`, dto);
  return res.data;
}

export async function adminDeleteHelpArticle(id: string) {
  const res = await apiDelete<{ ok: true }>(`/admin/help/articles/${id}`);
  return res.data;
}
