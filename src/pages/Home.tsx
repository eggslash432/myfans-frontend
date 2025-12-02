// front/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, normalizeList } from '../lib/api';

export default function HomePage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listCreators();
        console.debug('GET /creators raw:', list);
        setCreators(normalizeList(list) ?? []);
      } catch (err: any) {
        console.error('GET /creators failed:', err);
        setError(err?.message || '取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">クリエイター一覧を読み込み中です…</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <section className="card">
          <p className="text-sm text-red-600">{error}</p>
        </section>
      </div>
    );
  }

  // 正規化して各カードに出したい情報を組み立て
  const items = creators.map((c) => {
    const name =
      c.publicName ??
      c.displayName ??
      c.name ??
      (c.email ? c.email.split('@')[0] : 'クリエイター');

    const trimmed = String(name).trim();
    const initial = trimmed ? trimmed.charAt(0).toUpperCase() : '?';

    // あれば使う（無ければ 0）
    const postCount = c.postCount ?? c.postsCount ?? 0;
    const fanCount = c.fanCount ?? c.subscriberCount ?? 0;

    return {
      ...c,
      _displayName: name,
      _initial: initial,
      _postCount: postCount,
      _fanCount: fanCount,
    };
  });

  return (
    <div className="page space-y-4">
      {/* 見出しカード */}
      <section className="card">
        <div className="section-title">クリエイター</div>
        <p className="section-subtitle">
          お気に入りのクリエイターを見つけて、投稿やプランをチェックしましょう。
        </p>
      </section>

      {/* クリエイター一覧 */}
      {items.length === 0 ? (
        <section className="card">
          <p className="section-subtitle">
            現在、表示できるクリエイターはいません。
          </p>
        </section>
      ) : (
        <section className="space-y-2">
          {items.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/creators/${c.id}`)}
              className="card-link w-full text-left"
            >
              <div className="card flex items-center gap-3">
                {/* 丸アイコン（頭文字） */}
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500 flex-shrink-0">
                  {c._initial}
                </div>

                {/* テキスト部 */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">
                    {c._displayName}
                  </div>

                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {c.bio || '自己紹介はまだ登録されていません。'}
                  </div>

                  <div className="mt-1 text-[11px] text-gray-400">
                    投稿 {c._postCount} 件
                    {c._fanCount ? `・ファン ${c._fanCount} 人` : null}
                  </div>
                </div>

                {/* 右側の矢印的ラベル */}
                <div className="text-xs text-pink-500 flex-shrink-0">
                  プロフィール ›
                </div>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
