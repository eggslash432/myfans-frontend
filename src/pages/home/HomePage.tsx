// front/src/pages/home/HomePage.tsx

import { useNavigate } from "react-router-dom";
import AdminNewsSection from "../../components/home/AdminNewsSection";
import CreatorListSection from "../../components/home/CreatorListSection";
import { useHomeData } from "./useHomeData";

export default function HomePage() {
  const navigate = useNavigate();
  const { creators, adminPosts, loading, error } = useHomeData();

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
        genres={[
          { id: "1", name: "雑談", count: 123456 },
          { id: "2", name: "写真", count: 23456 },
          { id: "3", name: "動画", count: 34567 },
          { id: "4", name: "音声", count: 4567 },
        ]}
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
