// front/src/pages/home/GenreDetailPage.tsx

import { 
  useParams, 
  useNavigate 
} from "react-router-dom";
import type { 
  UiCreator, 
  UiAdminPost 
} from "@/shared";
import { CreatorCard } from "@/features/creators";
import { PostCard } from "@/features/posts";

export function GenreDetailPage() {
  const { genreId } = useParams<{ genreId: string }>();
  const navigate = useNavigate();

  // ✅ 型付きで空配列を用意（仮）
  const creators: UiCreator[] = [];
  const posts: UiAdminPost[] = [];

  return (
    <div className="page">
      <div className="section-title">
        ジャンル：{genreId}
      </div>

      {/* クリエイター */}
      <section>
        {creators.length === 0 ? (
          <div className="card">
            <p className="section-subtitle">
              このジャンルのクリエイターはまだいません
            </p>
          </div>
        ) : (
          creators.map((c) => (
            <CreatorCard
              key={c.id}
              creator={c}
              onClick={() => navigate(`/creators/${c.id}`)}
            />
          ))
        )}
      </section>

      {/* 投稿 */}
      <section>
        {posts.length === 0 ? (
          <div className="card">
            <p className="section-subtitle">
              このジャンルの投稿はまだありません
            </p>
          </div>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onOpen={(id) => navigate(`/posts/${id}`)} // ✅ 必須
            />
          ))
        )}
      </section>
    </div>
  );
}
