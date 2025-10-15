// PostGrid.tsx
import PostCard from './PostCard';
import type { PostItem } from './PostCard';  // ← 型は type-only で

export type { PostItem }; // ← 再エクスポートも「type」扱い

export default function PostGrid({
  posts,
  onOpen,
}: {
  posts: PostItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} onOpen={onOpen} />
      ))}
    </div>
  );
}
