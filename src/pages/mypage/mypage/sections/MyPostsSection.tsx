// front/src/pages/mypage/mypage/sections/MyPostsSection.tsx
import React from 'react';
import StatusBadge from '../../../../components/ui/StatusBadge';
import type { PostSummary } from '../../../../shared/types';

type Props = {
  publicPosts: PostSummary[];
  privatePosts: PostSummary[];
  draftPosts: PostSummary[];
  onOpenEdit: (p: PostSummary) => void;
};

function PostsList({ items, onOpenEdit }: { items: PostSummary[]; onOpenEdit: (p: PostSummary) => void }) {
  return (
    <ul className="divide-y divide-gray-100 mt-2">
      {items.map((p) => (
        <li key={p.id} className="py-2 text-sm flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{p.title}</div>
            <StatusBadge publishedStatus={p.publishedStatus} visibility={p.visibility} />
          </div>
          <button
            onClick={() => onOpenEdit(p)}
            className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
          >
            <span>詳細・編集</span>
            <span style={{ fontSize: '12px' }}>›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

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
