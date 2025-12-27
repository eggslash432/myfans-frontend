// front/src/pages/posts/postDetail/PostHeader.tsx
import type { PostDetail } from '@/shared';

type Props = {
  post: PostDetail;
  isFree: boolean;
  isPlan: boolean;
  isPpv: boolean;
  canView: boolean;
  isR18: boolean;
};

export function PostHeader({ post, isFree, isPlan, isPpv, canView, isR18 }: Props) {
  return (
    <header className="post-detail-header">
      <h1 className="post-detail-title">{post.title}</h1>

      <div className="post-detail-meta">
        <span className="post-detail-author">
          {post.creator?.publicName ? `by ${post.creator.publicName}` : 'by 運営'}
        </span>
      </div>

      <div className="post-detail-tags">
        {isPpv && (
          <span className="post-detail-badge">
            単品価格{' '}
            {post.priceJpy != null ? `¥${post.priceJpy.toLocaleString()}` : '価格未設定'}
          </span>
        )}
        {isPlan && (
          <span className="post-detail-badge post-detail-badge-plan">プラン限定投稿</span>
        )}
        {isFree && (
          <span className="post-detail-badge post-detail-badge-free">無料投稿</span>
        )}
        {isR18 && <span className="post-detail-badge post-detail-badge-r18">R18</span>}
        {isPlan && canView && <span className="post-detail-badge">このプランを購読中</span>}
      </div>
    </header>
  );
}
