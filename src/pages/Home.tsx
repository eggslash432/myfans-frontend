// front/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, normalizeList } from '../lib/api';

export default function HomePage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [adminPosts, setAdminPosts] = useState<any[]>([]); // ★ 運営投稿
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [creatorList, adminPostList] = await Promise.all([
          api.listCreators(),
          api.listAdminPosts(),  // /posts/public/admin
        ]);

        console.debug('GET /creators raw:', creatorList);
        setCreators(normalizeList(creatorList) ?? []);
        setAdminPosts(normalizeList(adminPostList) ?? []);  // ★ ここも normalizeList
      } catch (err: any) {
        console.error('Home load failed:', err);
        setError(err?.message || '一覧の取得に失敗しました');
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
      avatarUrl: c.avatarUrl ?? c.profileImageUrl ?? null, // ← 追加
      _displayName: name,
      _initial: initial,
      _postCount: postCount,
      _fanCount: fanCount,
    };
  });

  return (
    <div className="page space-y-4">
      {/* ▼ 運営からのお知らせ（管理者投稿） */}
      {adminPosts.length > 0 && (
        <section className="card admin-news-card">
          <div className="section-title">運営からのお知らせ</div>

          <div className="admin-news-list">
            {adminPosts.map((p) => {
              const dateRaw = p.publishedAt || p.createdAt;
              const dateStr = dateRaw
                ? new Date(dateRaw).toLocaleDateString('ja-JP')
                : '';

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/posts/${p.id}`)}
                  className="admin-news-item"
                >
                  <div className="admin-news-meta">
                    <span className="admin-news-pill">お知らせ</span>
                    {dateStr && (
                      <span className="admin-news-date">{dateStr}</span>
                    )}
                  </div>

                  <div className="admin-news-title">
                    {p.title}
                  </div>

                  <div className="admin-news-body">
                    {p.body || '詳細を見る'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

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
              className="card-link w-full text左"
            >
              <div className="card flex items-center gap-3">
                {/* アイコン（画像があれば画像、なければ頭文字） */}
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500 flex-shrink-0 overflow-hidden">
                  {c.avatarUrl ? (
                    <img
                      src={c.avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{c._initial}</span>
                  )}
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
