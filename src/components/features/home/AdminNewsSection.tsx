// front/src/components/home/AdminNewsSection.tsx

import type { UiAdminPost } from "../../pages/home/types";

export function AdminNewsSection({
  posts,
  onOpenPost,
}: {
  posts: UiAdminPost[];
  onOpenPost: (postId: string) => void;
}) {
  if (!posts.length) return null;

  return (
    <section className="card admin-news-card">
      <div className="section-title">運営からのお知らせ</div>

      <div className="admin-news-list">
        {posts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenPost(p.id)}
            className="admin-news-item"
          >
            <div className="admin-news-meta">
              <span className="admin-news-pill">お知らせ</span>
              {p.dateStr && <span className="admin-news-date">{p.dateStr}</span>}
            </div>

            <div className="admin-news-title">{p.title}</div>
            <div className="admin-news-body">{p.body}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
