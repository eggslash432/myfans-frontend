// front/src/pages/posts/postDetail/LockedPanel.tsx
import React from 'react';
import type { PostDetail } from '../../../shared/types';

type Props = {
  isPlan: boolean;
  isPpv: boolean;
  post: PostDetail;

  busyPlan: boolean;
  busyPpv: boolean;
  onBuyPpv: () => void;
  onSubscribe: () => void;
};

export function LockedPanel({
  isPlan,
  isPpv,
  post,
  busyPlan,
  busyPpv,
  onBuyPpv,
  onSubscribe,
}: Props) {
  return (
    <div className="post-detail-locked">
      {isPlan ? (
        <p>この投稿は有料です。このプランへの加入が必要です。</p>
      ) : isPpv ? (
        <p>この投稿は有料です。この投稿の単品購入が必要です。</p>
      ) : (
        <p>この投稿は有料です。</p>
      )}

      <div className="post-detail-actions">
        {isPpv && (
          <button onClick={onBuyPpv} disabled={busyPpv} className="btn btn-primary">
            {busyPpv ? '処理中…' : 'この投稿を単品購入'}
          </button>
        )}

        {isPlan && post.planId && (
          <button onClick={onSubscribe} disabled={busyPlan} className="btn btn-primary">
            {busyPlan ? '処理中…' : 'このプランに加入する'}
          </button>
        )}
      </div>
    </div>
  );
}
