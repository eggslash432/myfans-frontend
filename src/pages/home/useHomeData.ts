// front/src/pages/home/useHomeData.ts

import { useEffect, useState } from "react";
import { listCreators, getOfficialPosts } from "../../lib/api";
import { normalizeList } from "../../lib/domain/normalize";
import type { UiAdminPost, UiCreator } from "./types";

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

  return { creators, adminPosts, loading, error };
}
