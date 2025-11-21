// myfans-frontend/src/pages/MyPage.tsx

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function MyPage() {
  const {user, ready} = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [err, setErr] = useState<string>('');
  const [posts, setPosts] = useState<any[]>([]);

  // creator: undefined = 読み込み中, null = いない, object = いる
  const [creator, setCreator] = useState<any | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);  

  const navigate = useNavigate();

  // --- 共通の Creator 再読み込み関数 ---
  const loadCreator = useCallback(async () => {
    if (!ready || !user) return;
    try {
      const c = await api.getCreatorMe();
      setCreator(c);
    } catch (e: any) {
      const msg = e?.message ?? '';
      // 404 / creator not found のときだけ「いない」とみなす
      if (/creator not found/i.test(msg) || /404/.test(msg)) {
        setCreator(null);
      } else {
        console.error('getCreatorMe failed', e);
        // ここはエラーとして扱いたければ別途表示してもOK
        setCreator(null);
      }
    }
  }, [ready, user]);    

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      try { setSummary(await api.meSummary()); } 
      catch (e: any) { setErr(e.message || 'failed'); }
    })();
  }, [ready, user]);

  // --- 投稿 ---
  useEffect(() => {
    if (!ready || !user) return;
    api
      .myPosts()
      .then((res) => setPosts(res.items ?? []))
      .catch((e) => console.error('投稿取得失敗:', e));
  }, [ready, user]);

  // --- Creator 情報読込 ---
  useEffect(() => {
    loadCreator();
  }, [loadCreator]);

  // --- クリエイター登録ボタン ---
  const handleApplyCreator = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 表示名はとりあえずメールの@前
      const publicName =
        (user as any).displayName ??
        (user.email ? user.email.split('@')[0] : '新しいクリエイター');

      await api.applyCreator({ publicName });
      alert('クリエイター登録が完了しました');

      // ★常に /creators/me でもう一度取り直す
      await loadCreator();
    } catch (e: any) {
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


  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">マイページ</h1>

      {/* --- クリエイター部分 --- */}
      {creator === undefined && (
        <section className="p-4 rounded border mb-4">クリエイター情報を読み込み中...</section>
      )}

      {creator === null && (
        <section className="p-4 rounded border mb-4">
          <h2 className="font-semibold mb-2">クリエイター登録</h2>
          <p className="mb-2">
            まだクリエイター登録が完了していません。<br />
            クリエイター登録を行うと、投稿の販売やサブスクプランの作成ができるようになります。
          </p>
          <button
            onClick={handleApplyCreator}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {loading ? '登録中…' : 'クリエイター登録する'}
          </button>
        </section>
      )}

      {creator && (
        <section className="p-4 rounded border mb-4">
          <h2 className="font-semibold mb-1">クリエイター情報</h2>
          <p className="text-sm">
            表示名：{creator.publicName ?? '(未設定)'}
          </p>
        </section>
      )}

      {creator && (
        <section className="border rounded p-4 space-y-2">
          <h2 className="font-semibold">クリエイター向けメニュー</h2>
          {/* 他のメニュー */}
          <button
            onClick={() => navigate('/creator/payouts')}
            className="px-3 py-2 rounded border"
          >
            出金管理
          </button>
        </section>
      )}      

      {/* --- 既存のマイ投稿／サマリー --- */}
      <h2 className="text-xl font-bold mb-4">マイ投稿一覧</h2>
      {posts.length === 0 && <p>投稿がありません。</p>}
      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <strong>{p.title}</strong>
            {p.publishedStatus === 'published' ? (
              <span className="ml-2 text-green-600">公開中</span>
            ) : (
              <span className="ml-2 text-gray-500">下書き</span>
            )}
          </li>
        ))}
      </ul>

      <section className="p-4 rounded border">
        <h2 className="font-semibold">購読状況</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(summary.subscriptions || [], null, 2)}
        </pre>
      </section>

      <section className="p-4 rounded border">
        <h2 className="font-semibold">支払い履歴</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(summary.payments || [], null, 2)}
        </pre>
      </section>
    </div>
  );
}
