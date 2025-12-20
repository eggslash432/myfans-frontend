// front/src/pages/mypage/MyPage.tsx
import { useState } from 'react';
import { PostEditModal } from '../posts/postEditModal/PostEditModal';

import { useMyPageData } from './mypage/useMyPageData';
import { usePostEditor } from './mypage/usePostEditor';

import { AccountCard } from './mypage/sections/AccountCard';
import { CreatorArea } from './mypage/sections/CreatorArea';
import { MyPostsSection } from './mypage/sections/MyPostsSection';
import { SubscriptionsSection } from './mypage/sections/SubscriptionsSection';
import { PaymentsSection } from './mypage/sections/PaymentsSection';

export function MyPage() {
  const {
    ready,
    user,
    isAdmin,

    summary,
    summaryErr,

    creator,
    loadCreator,

    isApproved,
    isPending,
    isRejected,
    isNotApplied,

    setPosts,
    splitPosts,
  } = useMyPageData();

  const [loading, setLoading] = useState(false);

  const { publicPosts, privatePosts, draftPosts } = splitPosts;

  const needsKyc = !creator?.stripePayoutsEnabled;

  const editor = usePostEditor({
    onUpdateList: (postId, patch) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...patch } : p)));
    },
  });

  // --- guards ---
  if (isAdmin) return <div className="p-4">管理画面へ移動しています…</div>;
  if (!ready) return <div className="p-4">読み込み中...</div>;
  if (!user) {
    return (
      <div className="p-4">
        ログインが必要です。右上の「ログイン」からサインインしてください。
      </div>
    );
  }
  if (summaryErr) {
    return (
      <div className="p-4 text-red-700">
        {/Unauthorized|401/i.test(summaryErr)
          ? 'ログインが必要です。右上の「ログイン」からサインインしてください。'
          : `サマリー取得に失敗: ${summaryErr}`}
      </div>
    );
  }
  if (!summary) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="page space-y-4">
      <h1 className="page-title">マイページ</h1>

      <AccountCard email={user.email} />

      <CreatorArea
        user={user}
        creator={creator}
        loading={loading}
        setLoading={setLoading}
        needsKyc={needsKyc}
        isNotApplied={isNotApplied}
        isPending={isPending}
        isRejected={isRejected}
        isApproved={isApproved}
        onReloadCreator={loadCreator}
      />

      {creator && isApproved && (
        <MyPostsSection
          publicPosts={publicPosts}
          privatePosts={privatePosts}
          draftPosts={draftPosts}
          onOpenEdit={editor.openEdit}
        />
      )}

      <SubscriptionsSection summary={summary} />
      <PaymentsSection summary={summary} />

      <PostEditModal
        post={editor.editingPost}
        open={editor.editOpen}
        saving={editor.saving}
        onClose={editor.closeEdit}
        onSubmit={editor.submitEdit}
        onAddMedia={editor.addMedia}
        onRemoveMedia={editor.removeMedia}
      />
    </div>
  );
}
