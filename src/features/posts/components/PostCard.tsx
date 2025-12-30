// front/src/components/PostCard.tsx

import { PurchaseButton } from '@/features/payments';
import type { PostItem } from '@/types';

export function PostCard({ post, onOpen }: { post: PostItem; onOpen: (id: string) => void }) {
  const derivedFree =
    (post.visibility === 'free') ||
    (typeof post.price === 'number' ? post.price === 0 : false);

  const isFree = typeof post.isFree === 'boolean' ? post.isFree : derivedFree;  // ★ここを変更
  const isAccessible = !!post.isAccessible;
  const canOpen = isFree || isAccessible;

  return (
    <div className="rounded-2xl shadow p-3 bg-white flex flex-col gap-3">
      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
        {post.coverUrl ? (
          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400">No Image</div>
        )}
        {!canOpen && (
          <div className="absolute inset-0 bg-black/40 grid place-items-center text-white text-sm">
            ロック中（未購入）
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold line-clamp-1">{post.title}</h3>

        {/* 投稿者名 */}
        {post.creatorName && (
          <div className="text-xs text-gray-500 mt-0.5">
            by {post.creatorName}
          </div>
        )}        
        {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{post.excerpt}</p>}
        {post.debugFlags && <p className="text-[11px] text-gray-400 mt-1">DEBUG: {post.debugFlags}</p>}
      </div>

      <div className="flex items-center justify-between">
        {canOpen ? (
          <button className="px-4 py-2 rounded-2xl border" onClick={() => onOpen(post.id)}>開く</button>
        ) : (
          // 無料なら購入ボタンは出さない（念のため二重ガード）
          !isFree && <PurchaseButton postId={post.id} priceYen={post.price ?? undefined} />
        )}
        {!isFree && (
          <span className="text-sm text-gray-600">
            {typeof post.price === 'number' ? `¥${post.price.toLocaleString()}` : '有料'}
          </span>
        )}
      </div>
    </div>
  );
}
