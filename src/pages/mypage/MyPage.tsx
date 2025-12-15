// front/src/pages/mypage/MyPage.tsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  API_ORIGIN,
  getUserMe,
  getCreatorMe, 
  applyCreator, 
  myPosts,
  getPost,
  updateMyPost,
  uploadPostMedia,
  deleteMyPostMedia,
  createStripeOnboardingLink,
} from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { PostEditModal } from '../posts/PostEditModal';
import type { PublishedStatus } from '../../shared/prisma-enums';
import type { 
  CreatorMeResponse, 
  MeSummary, 
  PostSummary, 
} from '../../shared/types';
import StatusBadge from "../../components/ui/StatusBadge";
import KycStatusBadge from '../../components/ui/KycStatusBadge';
import CreatorMonetizationStatus from "../../components/ui/CreatorMonetizationStatus";
import SubStatusBadge from '../../components/ui/SubStatusBadge';

export default function MyPage() {
  const { user, ready } = useAuth();
  const [summary, setSummary] = useState<MeSummary>();
  const [err, setErr] = useState<string>('');
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // creator: undefined = 読み込み中, null = いない, object = いる
  const [creator, setCreator] = useState<CreatorMeResponse | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const role = (user as any)?.role;
  const isAdmin = role === 'admin';
  const isCreator = role === 'creator';

  const approval = creator?.approvalStatus ?? null;
  const isApproved = approval === 'approved';
  const isPending  = approval === 'pending';
  const isRejected = approval === 'rejected';
  const isNotApplied = creator === null;

  // ✅ 追加：表示用 KYC ステータス（null対策）
  const uiKycStatus =
    !creator?.stripeAccountId ? 'not_started' : (creator?.stripeKycStatus ?? 'pending');

  const needsKyc = !creator?.stripePayoutsEnabled; // 出金できるようにするにはKYCが必要、という扱い  

  useEffect(() => {
    if (!ready || !user) return;
    if (!isAdmin) return;

    navigate('/admin', { replace: true }); 
  }, [ready, user, isAdmin, navigate]);  

  // --- 共通の Creator 再読み込み関数 ---
  const loadCreator = useCallback(async () => {
    if (!ready || !user) return;

    try {
      const res = await getCreatorMe();

      // ★ よくあるラップを剥がす
      const c =
        (res as any)?.data ??
        (res as any)?.creator ??
        (res as any)?.item ??
        res;

      // ★ “クリエイターとして成立する形”か確認（id or approvalStatus が無いなら未申請扱い）
      const ok =
        c && (typeof c === "object") && (
          typeof (c as any).id === "string" ||
          typeof (c as any).approvalStatus === "string"
        );

      setCreator(ok ? (c as CreatorMeResponse) : null);
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.error('getCreatorMe failed:', e);

      // 404/creator not found なら未申請
      if (/creator not found/i.test(msg) || /404/.test(msg)) {
        setCreator(null);
      } else {
        // それ以外は “読み込み失敗” を分けたいなら undefined のままでもOKだが、
        // UIを出したいなら null に倒す
        setCreator(null);
      }
    }
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try {
        setSummary(await getUserMe());
      } catch (e: any) {
        setErr(e.message || 'failed');
      }
    })();
  }, [ready, user]);

  // --- 投稿 ---
  useEffect(() => {
    if (!ready || !user) return;
    if (!isApproved) return;

    myPosts()
      .then((res) => setPosts(res.items ?? [])) // ★ items を使う
      .catch((e) => console.error('投稿取得失敗:', e));
  }, [ready, user, isApproved]);

  useEffect(() => {
    if (!ready) return;

    // ★ 承認済みでないなら投稿は見せないのでクリア
    if (!isApproved) setPosts([]);
  }, [ready, isApproved]);

  // --- Creator 情報読込 ---
  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  const handleApplyCreator = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const publicName =
        (user as any).displayName ??
        (user.email ? user.email.split('@')[0] : '新しいクリエイター');

      await applyCreator({ publicName });
      await loadCreator();
      alert('クリエイター申請を受け付けました（審査中）');
    } catch (e: any) {
      console.error('applyCreator failed', e);
      alert(e?.message ?? '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ✅ /creator → /creators に統一
  const creatorMenuItems = [
    { label: '投稿管理', description: '投稿の一覧・編集・公開設定', path: '/creators/posts', icon: '📝' },
    { label: 'プラン設定', description: '月額プランの作成・編集', path: '/creators/plans', icon: '📦' },
    { label: '出金管理', description: '売上の振込口座・出金履歴', path: '/creators/payouts', icon: '💰' },
    { label: '売上レポート', description: '期間別の売上・購読状況', path: '/creators/analytics', icon: '📊' },
  ];

  const subscriptionCount = (summary?.subscriptions ?? []).length;
  const paymentCount = (summary?.payments ?? []).length;

  // ★ ここで「公開中」と「下書き」に振り分ける
  const publicPosts = posts.filter((p) => p.publishedStatus === 'published');
  const draftPosts  = posts.filter((p) => p.publishedStatus === 'draft');
  const privatePosts = posts.filter((p) => p.publishedStatus === 'private'); 

  const openEdit = async (summaryPost: any) => {
    try {
      const res = await getPost(summaryPost.id);

      // ★ data / post ラップをはがして中身だけにする
      const full =
        (res as any).data ??
        (res as any).post ??
        res;

      console.log('openEdit full:', full);
      setEditingPost(full);
      setEditOpen(true);
    } catch (e: any) {
      console.error('getPost failed', e);
      alert(e?.message ?? '投稿の取得に失敗しました');
    }
  };

  const handleSubmitEdit = async (payload: {
    title: string;
    body: string;
    visibility: 'free' | 'plan' | 'paid_single';
    priceJpy: number | null;
    publishedStatus: PublishedStatus;
  }) => {
    if (!editingPost) return;
    try {
      setSaving(true);

      await updateMyPost(editingPost.id, payload);

      // 一覧側は title / status だけ反映しておけばOK
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: payload.title, publishedStatus: payload.publishedStatus }
            : p,
        ),
      );

      setEditOpen(false);
      setEditingPost(null);
    } catch (e: any) {
      console.error('updateMyPost failed', e);
      alert(e?.message ?? '投稿の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // メディア追加
  const handleAddMedia = async (files: FileList) => {
    if (!editingPost) return;
    try {
      const uploaded: any[] = [];

      for (const file of Array.from(files)) {
        const res = await uploadPostMedia(editingPost.id, [file]); // ★ ここを [file] に
        // uploadPostMedia が配列を返す前提
        if (Array.isArray(res)) {
          uploaded.push(...res);
        } else {
          uploaded.push(res);
        }
      }

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        return {
          ...prev,
          mediaAssets: [...raw, ...uploaded],
        };
      });
    } catch (e: any) {
      console.error('uploadPostMedia failed', e);
      alert(e?.message ?? 'メディアの追加に失敗しました');
    }
  };

  // メディア削除
  const handleRemoveMedia = async (mediaId: string) => {
    if (!editingPost) return;
    if (!confirm('このメディアを削除しますか？')) return;

    try {
      await deleteMyPostMedia(editingPost.id, mediaId);

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        const filtered = raw.filter((m: any) => m.id !== mediaId);
        return {
          ...prev,
          mediaAssets: filtered,
        };
      });
    } catch (e: any) {
      console.error('メディア削除失敗', e);
      alert(e?.message ?? 'メディアの削除に失敗しました');
    }
  };

  // --- 各種ガード ---
  if (isAdmin) {
    return <div className="p-4">管理画面へ移動しています…</div>;
  }
  if (!ready) return <div className="p-4">読み込み中...</div>;
  if (!user)
    return (
      <div className="p-4">
        ログインが必要です。右上の「ログイン」からサインインしてください。
      </div>
    );
  if (err)
    return (
      <div className="p-4 text-red-700">
        {/Unauthorized|401/i.test(err)
          ? 'ログインが必要です。右上の「ログイン」からサインインしてください。'
          : `サマリー取得に失敗: ${err}`}
      </div>
    );
  if (!summary) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="page space-y-4">
      {/* ページタイトル */}
      <h1 className="page-title">マイページ</h1>

      {/* アカウント概要 */}
      <section className="card">
        <div className="section-title flex items-center justify-between">
          <span>アカウント情報</span>
        </div>
        <p className="section-subtitle mb-3">
          ご契約中のプランや購入履歴を確認できます。
        </p>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">ログイン中のユーザー：</span>
            {user.email}
          </div>
          <div className="text-xs text-gray-500">
            ※パスワードの変更は「設定」から行なえます。
          </div>
        </div>
      </section>

      {/* クリエイター関連エリア */}
      {/* 読み込み中 */}
      {creator === undefined && (
        <section className="card">
          <div className="section-title">クリエイター情報</div>
          <p className="section-subtitle">クリエイター情報を読み込み中です...</p>
        </section>
      )}

      {/* 未申請（creator が null or approvalStatus が無い） */}
      {isNotApplied && (
        <section className="card space-y-3">
          <div className="section-title">クリエイター登録</div>
          <p className="section-subtitle">
            クリエイター登録を行うと、投稿の販売やサブスクプランの作成ができるようになります。
          </p>
          <button
            onClick={handleApplyCreator}
            disabled={loading}
            className="btn btn-primary w-full justify-center"
          >
            {loading ? '登録中…' : 'クリエイター登録する'}
          </button>
        </section>
      )}

      {/* 審査中 */}
      {creator && isPending && (
        <section className="card">
          <div className="section-title">審査中</div>
          <p className="section-subtitle">
            クリエイター申請を受け付けました。現在、管理者による審査中です。
          </p>
        </section>
      )}

      {/* 差戻し */}
      {creator && isRejected && (
        <section className="card space-y-2">
          <div className="section-title">申請が差し戻されました</div>

          {creator.rejectReason && (
            <p className="text-sm text-red-600">
              理由：{creator.rejectReason}
            </p>
          )}

          <button
            onClick={handleApplyCreator}
            disabled={loading}
            className="btn btn-primary"
          >
            再申請する
          </button>
        </section>
      )}

      {/* 承認済み */}
      {creator && isApproved && (
        <>
          <section className="card">
            <div className="section-title flex items-center justify-between">
              <span>クリエイター情報</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/creators/profile')}
              >
                詳細
              </button>
            </div>

            {(() => {
              const displayName = creator.publicName ?? '(未設定)';

              const rawAvatarUrl = creator.avatarUrl ?? undefined;
              const avatarSrc = rawAvatarUrl
                ? rawAvatarUrl.startsWith('http')
                  ? rawAvatarUrl
                  : `${API_ORIGIN}${rawAvatarUrl}`
                : null;

              return (
                <div className="flex items-start gap-3 mt-3">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="profile-avatar-preview"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{displayName}</div>

                    {creator.bio ? (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                        {creator.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        自己紹介はまだ登録されていません。
                      </p>
                    )}

                    {/* おまけ：KYC 状態 */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">本人確認</span>

                      {/* ✅ 未開始 */}
                      {!creator.stripeAccountId ? (
                        <span className="badge badge-gray">未開始</span>
                      ) : (
                        <KycStatusBadge
                          // ✅ null のとき pending 表示に倒す（もしくはKycStatusBadge側で対応でもOK）
                          status={(creator.stripeKycStatus ?? 'pending') as any}
                          disabledReason={creator.stripeKycDisabledReason}
                        />
                      )}

                      {needsKyc && (
                        <span className="text-gray-400">（出金には本人確認が必要です）</span>
                      )}
                    </div>

                    <CreatorMonetizationStatus
                      // ✅ null のまま渡さない（コンポーネント側の表示も安定する）
                      stripeKycStatus={(creator.stripeKycStatus ?? 'pending') as any}
                      stripeChargesEnabled={creator.stripeChargesEnabled}
                      stripePayoutsEnabled={creator.stripePayoutsEnabled}
                      stripeKycDisabledReason={creator.stripeKycDisabledReason}
                      stripeKycFieldsDue={creator.stripeKycFieldsDue}
                      onClickFix={async () => {
                        const { url } = await createStripeOnboardingLink();
                        window.location.href = url;
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </section>

          <section className="card space-y-3">
            <div className="section-title">クリエイターメニュー</div>
            <p className="section-subtitle">
              よく使う機能に素早くアクセスできます。
            </p>
            <div className="mt-1 space-y-2">
              {creatorMenuItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="btn btn-outline w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </span>
                  <span className="text-xs text-gray-400">›</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* マイ投稿一覧（ネスト：公開 / 非公開 / 下書き） */}
      {creator && isApproved && (
        <section className="card">
          <div className="section-title">マイ投稿一覧</div>

          <details open className="mt-2">
            <summary className="cursor-pointer text-sm font-semibold">
              公開（{publicPosts.length}）
            </summary>
            {publicPosts.length === 0 ? (
              <p className="section-subtitle mt-2">まだ公開中の投稿がありません。</p>
            ) : (
              <ul className="divide-y divide-gray-100 mt-2">
                {publicPosts.map((p) => (
                  <li key={p.id} className="py-2 text-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <StatusBadge
                        publishedStatus={p.publishedStatus}
                        visibility={p.visibility}
                      />
                    </div>
                    <button
                      onClick={() => openEdit(p)}
                      className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                    >
                      <span>詳細・編集</span>
                      <span style={{ fontSize: "12px" }}>›</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold">
              非公開（{privatePosts.length}）
            </summary>
            {privatePosts.length === 0 ? (
              <p className="section-subtitle mt-2">非公開の投稿はありません。</p>
            ) : (
              <ul className="divide-y divide-gray-100 mt-2">
                {privatePosts.map((p) => (
                  <li key={p.id} className="py-2 text-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <StatusBadge
                        publishedStatus={p.publishedStatus}
                        visibility={p.visibility}
                      />
                    </div>
                    <button
                      onClick={() => openEdit(p)}
                      className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                    >
                      <span>詳細・編集</span>
                      <span style={{ fontSize: "12px" }}>›</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold">
              下書き（{draftPosts.length}）
            </summary>
            {draftPosts.length === 0 ? (
              <p className="section-subtitle mt-2">下書きはありません。</p>
            ) : (
              <ul className="divide-y divide-gray-100 mt-2">
                {draftPosts.map((p) => (
                  <li key={p.id} className="py-2 text-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <StatusBadge
                        publishedStatus={p.publishedStatus}
                        visibility={p.visibility}
                      />
                    </div>
                    <button
                      onClick={() => openEdit(p)}
                      className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                    >
                      <span>詳細・編集</span>
                      <span style={{ fontSize: "12px" }}>›</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </section>
      )}  

      {/* 購読状況 */}
      <section className="card">
        <div className="section-title flex items-center justify-between">
          <span>購読状況</span>
          <span className="text-xs text-gray-500">
            現在 {subscriptionCount} 件のプランを購読中
          </span>
        </div>
        {subscriptionCount === 0 ? (
          <p className="section-subtitle">
            まだ購読中のプランはありません。
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {summary.subscriptions!.map((sub) => (
              <li
                key={sub.id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {sub.plan?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {sub.creator?.publicName} / ¥{sub.plan?.priceJpy} / {sub.plan?.billingInterval}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    期間：
                    {new Date(sub.currentPeriodStart).toLocaleDateString()} 〜{' '}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <SubStatusBadge status={sub.status} />
                  {sub.cancelAtPeriodEnd && (
                    <span className="text-xs text-red-500">次回更新で解約</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 支払い履歴 */}
      <section className="card mb-4">
        <div className="section-title flex items-center justify-between">
          <span>支払い履歴</span>
          <span className="text-xs text-gray-500">
            合計 {paymentCount} 件
          </span>
        </div>
        {paymentCount === 0 ? (
          <p className="section-subtitle">
            まだ決済履歴がありません。
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {summary.payments!.map((p) => (
              <li
                key={p.id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-sm">
                    ¥{p.amountJpy.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.kind === 'subscription'
                      ? `プラン：${p.plan?.name}`
                      : `単品購入：${p.post?.title}`}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(p.paidAt ?? p.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {p.creator?.publicName}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 投稿編集モーダル */}
      <PostEditModal
        post={editingPost}
        open={editOpen}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setEditOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleSubmitEdit}
        onAddMedia={handleAddMedia}
        onRemoveMedia={handleRemoveMedia}
      />

    </div>
  );
}
