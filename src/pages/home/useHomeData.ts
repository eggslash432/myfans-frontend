// front/src/pages/home/useHomeData.ts

import { useEffect, useMemo, useState } from "react";
import { listCreators, getOfficialPosts } from "../../lib/api";
import { normalizeList } from "../../lib/domain/normalize";
import type { UiAdminPost, UiCreator, Genre } from "./types";

function toInitial(name: string) {
  const trimmed = String(name ?? "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function toDisplayName(c: any) {
  const name =
    c.publicName ??
    c.displayName ??
    c.name ??
    (c.email ? c.email.split("@")[0] : "クリエイター");
  return String(name).trim() || "クリエイター";
}

function toCreatorUi(c: any): UiCreator {
  const displayName = toDisplayName(c);
  return {
    id: String(c.id),
    avatarUrl: c.avatarUrl ?? c.profileImageUrl ?? null,
    displayName,
    initial: toInitial(displayName),
    bio: c.bio || "自己紹介はまだ登録されていません。",
    postCount: Number(c.postCount ?? c.postsCount ?? 0),
    fanCount: Number(c.fanCount ?? c.subscriberCount ?? 0),
  };
}

function toAdminPostUi(p: any): UiAdminPost {
  const dateRaw = p.publishedAt || p.createdAt;
  const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString("ja-JP") : "";
  return {
    id: String(p.id),
    title: p.title || "（お知らせ）",
    body: p.body || "詳細を見る",
    dateStr,
  };
}

export function useHomeData() {
  const [creators, setCreators] = useState<UiCreator[]>([]);
  const [adminPosts, setAdminPosts] = useState<UiAdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ 追加：ひとまず固定（導線をまず完成させる）
  // 後で「投稿タグから自動生成」などに差し替え可能
  const genres: Genre[] = useMemo(
    () => [
      { id: "zatsudan", name: "雑談", count: 0 },
      { id: "photo", name: "写真", count: 0 },
      { id: "movie", name: "動画", count: 0 },
      { id: "voice", name: "音声", count: 0 },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [creatorList, officialPostList] = await Promise.all([
          listCreators(),
          getOfficialPosts(),
        ]);

        const creatorsRaw = normalizeList(creatorList) ?? [];
        setCreators(creatorsRaw.map(toCreatorUi));

        const postsRaw = normalizeList(officialPostList) ?? [];
        const official = postsRaw.filter((p: any) => p?.creatorId == null);
        setAdminPosts(official.map(toAdminPostUi));
      } catch (err: any) {
        console.error("Home load failed:", err);
        setError(err?.message || "一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ genres を返す
  return { creators, adminPosts, genres, loading, error };
}
