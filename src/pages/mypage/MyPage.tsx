// front/src/pages/mypage/MyPage.tsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMeSummary, 
  getCreatorMe, 
  applyCreator, 
  myPosts,
  getPost,
  updateMyPost,
  uploadPostMedia,
  deleteMyPostMedia,
} from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { PostEditModal } from '../posts/PostEditModal';
import type { PublishedStatus } from '../../shared/prisma-enums';
import type { 
  CreatorMeResponse, 
  MeSummary, 
  PostSummary 
} from '../../shared/types';

export default function MyPage() {
  const { user, ready, restore } = useAuth();
  const [summary, setSummary] = useState<MeSummary | null>(null);
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

  // --- 共通の Creator 再読み込み関数 ---
  const loadCreator = useCallback(async () => {
    if (!ready || !user) return;

    // creator 以外は creator 情報を使わない
    if (!isCreator) {
      setCreator(null);
      return;
    }

    try {
      const c = await getCreatorMe();
      setCreator(c);
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.error('getCreatorMe failed:', e);
      if (/creator not found/i.test(msg) || /404/.test(msg)) {
        setCreator(null);
      } else {
        console.error('getCreatorMe failed', e);
        setCreator(null);
      }
    }
  }, [ready, user, isCreator]);

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try {
        setSummary(await getMeSummary());
      } catch (e: any) {
        setErr(e.message || 'failed');
      }
    })();
  }, [ready, user]);

  // --- 投稿 ---
  useEffect(() => {
    if (!ready || !user) return;

    myPosts()
      .then((res) => setPosts(res.items ?? [])) // ★ items を使う
      .catch((e) => console.error('投稿取得失敗:', e));
  }, [ready, user]);

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

      // ★ 戻り値（creator オブジェクト）を受け取る
      const created = await applyCreator({ publicName });  
      
      // ★ state を即座に更新して画面を切り替える
      setCreator(created);    
      // ★ ここで /auth/me を叩きなおして role=creator を反映
      await restore(true);        

      await loadCreator();
      alert('クリエイター登録が完了しました');
    } catch (e: any) {
      console.error('applyCreator failed', e);
      alert(e?.message ?? '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const creatorMenuItems = [
    {
      label: '投稿管理',
      description: '投稿の一覧・編集・公開設定',
      path: '/creator/posts',
      icon: '📝',
    },
    {
      label: 'プラン設定',
      description: '月額プランの作成・編集',
      path: '/creator/plans',
      icon: '📦',
    },
    {
      label: '出金管理',
      description: '売上の振込口座・出金履歴',
      path: '/creator/payouts',
      icon: '💰',
    },
    {
      label: '売上レポート',
      description: '期間別の売上・購読状況',
      path: '/creator/analytics',
      icon: '📊',
    },
  ];

  const subscriptionCount = (summary?.subscriptions ?? []).length;
  const paymentCount = (summary?.payments ?? []).length;

  // ★ ここで「公開中」と「下書き」に振り分ける
  const publishedPosts = posts.filter(
    (p) => p.publishedStatus === 'published',
  );
  const draftPosts = posts.filter(
    (p) => p.publishedStatus !== 'published',
  );  

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
      {creator === undefined && (
        <section className="card">
          <div className="section-title">クリエイター情報</div>
          <p className="section-subtitle">クリエイター情報を読み込み中です...</p>
        </section>
      )}

      {!isAdmin && !isCreator && creator === null && (
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

      {isCreator && creator && (
        <>
          <section className="card space-y-2">
            <div className="section-title">クリエイター情報</div>
            <p className="section-subtitle">
              売上や出金、投稿の管理はクリエイターメニューから行えます。
            </p>
            <div className="text-sm">
              <div className="mb-1">
                <span className="font-semibold">表示名：</span>
                {creator.publicName ?? '(未設定)'}
              </div>
            </div>
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

      {/* マイ投稿一覧（公開中） */}
      <section className="card">
        <div className="section-title">マイ投稿一覧</div>
        {publishedPosts.length === 0 && (
          <p className="section-subtitle">まだ公開中の投稿がありません。</p>
        )}
        {publishedPosts.length > 0 && (
          <ul className="divide-y divide-gray-100 mt-2">
            {publishedPosts.map((p) => (
              <li
                key={p.id}
                className="py-2 text-sm flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">公開中</div>
                </div>
                <button
                  onClick={() => openEdit(p)}   
                  className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                >
                  <span>詳細・編集</span>
                  <span style={{ fontSize: '12px' }}>›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 下書き一覧 */}
      {draftPosts.length > 0 && (
        <section className="card">
          <div className="section-title">下書き一覧</div>
          <p className="section-subtitle text-xs">
            公開前の下書きや非公開投稿です。
          </p>
          <ul className="divide-y divide-gray-100 mt-2">
            {draftPosts.map((p) => (
              <li
                key={p.id}
                className="py-2 text-sm flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.publishedStatus === 'draft' ? '下書き' : '非公開'}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(p)}
                  className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                >
                  <span>詳細・編集</span>
                  <span style={{ fontSize: '12px' }}>›</span>
                </button>
              </li>
            ))}
          </ul>
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
            まだ購読中のプランはありません。お気に入りのクリエイターを探してみましょう。
          </p>
        ) : (
          <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(summary.subscriptions || [], null, 2)}
          </pre>
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
          <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(summary.payments || [], null, 2)}
          </pre>
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
