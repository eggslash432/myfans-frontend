// front/src/pages/home/HomePage.tsx

import { AdminNewsSection, CampaignBanner, CreatorListSection, GenreGridSection, useHomeData } from "@/features";
import { useNavigate } from "react-router-dom";


export function HomePage() {
  const navigate = useNavigate();
  const { creators, adminPosts, genres, loading, error } = useHomeData();

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">ホームを読み込み中です…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="card">
          <p className="text-sm text-red-600">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page space-y-6">
      {/* キャンペーン */}
      <CampaignBanner
        onClick={() => navigate("/campaign")}
      />

      {/* ジャンル */}
      <GenreGridSection
        genres={genres}
        onOpenGenre={(id) => navigate(`/genres/${id}`)}
        onMore={() => navigate("/genres")}
      />

      {/* 既存 */}
      <AdminNewsSection
        posts={adminPosts}
        onOpenPost={(id) => navigate(`/posts/${id}`)}
      />

      <CreatorListSection
        creators={creators}
        onOpenCreator={(id) => navigate(`/creators/${id}`)}
      />
    </div>
  );
}
