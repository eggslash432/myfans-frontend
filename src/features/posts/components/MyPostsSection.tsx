// front/src/components/MyPostsSection.tsx
import type { PostSummary } from '@/shared/types';
import { PostsList } from './PostsList';

type Props = {
  publicPosts: PostSummary[];
  privatePosts: PostSummary[];
  draftPosts: PostSummary[];
  onOpenEdit: (p: PostSummary) => void;
};

export function MyPostsSection({ publicPosts, privatePosts, draftPosts, onOpenEdit }: Props) {
  return (
    <section className="card">
      <div className="section-title">マイ投稿一覧</div>

      <details open className="mt-2">
        <summary className="cursor-pointer text-sm font-semibold">
          公開（{publicPosts.length}）
        </summary>
        {publicPosts.length === 0 ? (
          <p className="section-subtitle mt-2">まだ公開中の投稿がありません。</p>
        ) : (
          <PostsList items={publicPosts} onOpenEdit={onOpenEdit} />
        )}
      </details>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          非公開（{privatePosts.length}）
        </summary>
        {privatePosts.length === 0 ? (
          <p className="section-subtitle mt-2">非公開の投稿はありません。</p>
        ) : (
          <PostsList items={privatePosts} onOpenEdit={onOpenEdit} />
        )}
      </details>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          下書き（{draftPosts.length}）
        </summary>
        {draftPosts.length === 0 ? (
          <p className="section-subtitle mt-2">下書きはありません。</p>
        ) : (
          <PostsList items={draftPosts} onOpenEdit={onOpenEdit} />
        )}
      </details>
    </section>
  );
}
