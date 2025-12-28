// front/src/pages/home/useHomeData.ts

import { useEffect, useMemo, useState } from "react";
import { listCreators, getOfficialPosts } from "@/lib/api";
import { normalizeList } from "@/lib/domain";
import { type UiAdminPost, type UiCreator, type Genre, toCreatorUi, toAdminPostUi } from "@/shared";

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
