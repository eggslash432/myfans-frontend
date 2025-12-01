// front/src/pages/MyPage.tsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function MyPage() {
  const { user, ready, restore } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [err, setErr] = useState<string>('');
  const [posts, setPosts] = useState<any[]>([]);

  // creator: undefined = 読み込み中, null = いない, object = いる
  const [creator, setCreator] = useState<any | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const role = (user as any)?.role;
  const isAdmin = role === 'admin';

  // --- 共通の Creator 再読み込み関数 ---
  const loadCreator = useCallback(async () => {
    if (!ready || !user) return;
    try {
      const c = await api.getCreatorMe();
      setCreator(c);
    } catch (e: any) {
      const msg = e?.message ?? '';
      console.error('getCreatorMe failed:', e);
      // 404 / creator not found のときだけ「いない」とみなす
      if (/creator not found/i.test(msg) || /404/.test(msg)) {
        setCreator(null);
      } else {
        console.error('getCreatorMe failed', e);
        setCreator(null);
      }
    }
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try {
        setSummary(await api.meSummary());
      } catch (e: any) {
        setErr(e.message || 'failed');
      }
    })();
  }, [ready, user]);

  // --- 投稿 ---
  useEffect(() => {
    if (!ready || !user) return;
    api
      .myPosts()
      .then((items) => setPosts(items ?? []))
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
      const created = await api.applyCreator({ publicName });  
      
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

  const subscriptionCount = (summary.subscriptions || []).length;
  const paymentCount = (summary.payments || []).length;

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
            ※メールアドレスやパスワードの変更は「プロフィール編集」から行えます。
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

      {!isAdmin && creator === null && (
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

      {creator && (
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

          {/* クリエイターメニュー */}
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

      {/* マイ投稿一覧 */}
      <section className="card">
        <div className="section-title">マイ投稿一覧</div>
        {posts.length === 0 && (
          <p className="section-subtitle">まだ投稿がありません。</p>
        )}
        {posts.length > 0 && (
          <ul className="divide-y divide-gray-100 mt-2">
            {posts.map((p) => (
              <li key={p.id} className="py-2 text-sm flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.publishedStatus === 'published'
                      ? '公開中'
                      : '下書き'}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/posts/${p.id}`)}
                  className="ml-3 btn btn-sm btn-outline whitespace-nowrap"
                >
                  <span>詳細を見る</span>
                  <span style={{ fontSize: '12px' }}>›</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  );
}
