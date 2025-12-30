import { useEffect, useMemo, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import type { 
  PostSummary, 
  PublishedStatus 
} from "@/shared";
import { StatusBadge }from "@/components";
import { PostEditModal } from "@/pages";
import { deleteMyPostMedia, getPost, myPosts, updateMyPost } from "@/features/posts";
import { uploadPostMedia } from "@/features/media";


export function CreatorPostsPage() {
  const [items, setItems] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  // --- 編集モーダル ---
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await myPosts();
      setItems(data.items ?? []);
    } catch (e: any) {
      console.error("load my posts failed", e);
      setErr(e?.message ?? "投稿一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  // 既存 useEffect を reload() 呼び出しに寄せる（好みで）
  useEffect(() => {
    reload();
  }, [reload]);

  const openEdit = async (summaryPost: PostSummary) => {
    try {
      const res = await getPost(summaryPost.id);
      const full = (res as any).data ?? (res as any).post ?? res;
      setEditingPost(full);
      setEditOpen(true);
    } catch (e: any) {
      console.error("getPost failed", e);
      alert(e?.message ?? "投稿の取得に失敗しました");
    }
  };

  const handleSubmitEdit = async (payload: {
    title: string;
    body: string;
    visibility: "free" | "plan" | "paid_single";
    priceJpy: number | null;
    publishedStatus: PublishedStatus;
  }) => {
    if (!editingPost) return;
    try {
      setSaving(true);
      await updateMyPost(editingPost.id, payload);

      // 一覧即反映
      setItems((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, title: payload.title, publishedStatus: payload.publishedStatus }
            : p
        )
      );

      // モーダル閉じ
      setEditOpen(false);
      setEditingPost(null);

      // 必要ならサーバ再取得（媒体やvisibility変わる場合）
      // await reload();
    } catch (e: any) {
      console.error("updateMyPost failed", e);
      alert(e?.message ?? "投稿の更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedia = async (files: FileList) => {
    if (!editingPost) return;
    try {
      const uploaded: any[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadPostMedia(editingPost.id, [file]);
        if (Array.isArray(res)) uploaded.push(...res);
        else uploaded.push(res);
      }

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        return { ...prev, mediaAssets: [...raw, ...uploaded] };
      });
    } catch (e: any) {
      console.error("uploadPostMedia failed", e);
      alert(e?.message ?? "メディアの追加に失敗しました");
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    if (!editingPost) return;
    if (!confirm("このメディアを削除しますか？")) return;

    try {
      await deleteMyPostMedia(editingPost.id, mediaId);

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        return { ...prev, mediaAssets: raw.filter((m: any) => m.id !== mediaId) };
      });
    } catch (e: any) {
      console.error("deleteMyPostMedia failed", e);
      alert(e?.message ?? "メディアの削除に失敗しました");
    }
  };  

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await myPosts();
        setItems(data.items ?? []);
      } catch (e: any) {
        console.error("load my posts failed", e);
        setErr(e?.message ?? "投稿一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { publicPosts, draftPosts, privatePosts } = useMemo(() => {
    const publicPosts = items.filter((p) => p.publishedStatus === "published");
    const draftPosts = items.filter((p) => p.publishedStatus === "draft");
    const privatePosts = items.filter(
      (p) => p.publishedStatus !== "published" && p.publishedStatus !== "draft",
    );
    return { publicPosts, draftPosts, privatePosts };
  }, [items]);

  return (
    <div className="page space-y-4">
      <h1 className="page-title">投稿管理</h1>

      <section className="card space-y-3">
        <div className="flex justify-between items-center">
          <div className="section-title">自分の投稿一覧</div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/posts/new")}
          >
            新規投稿
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <p className="text-sm text-gray-500">まだ投稿がありません。</p>
        )}

        {!loading && !err && items.length > 0 && (
          <div className="space-y-3">
            <details open>
              <summary className="cursor-pointer text-sm font-semibold">
                公開（{publicPosts.length}）
              </summary>
              {publicPosts.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">公開中の投稿はありません。</p>
              ) : (
                <ul className="divide-y divide-gray-100 mt-2">
                  {publicPosts.map((p) => (
                    <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.title}</div>
                        <StatusBadge status={p.publishedStatus} />
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="btn btn-outline btn-sm whitespace-nowrap"
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/posts/${p.id}`)}
                          className="btn btn-outline btn-sm whitespace-nowrap"
                        >
                          詳細
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </details>

            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                非公開（{privatePosts.length}）
              </summary>
              {privatePosts.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">非公開の投稿はありません。</p>
              ) : (
                <ul className="divide-y divide-gray-100 mt-2">
                  {privatePosts.map((p) => (
                    <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.title}</div>
                        <StatusBadge status={p.publishedStatus} />
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/posts/${p.id}`)}
                        className="btn btn-outline btn-sm ml-3 whitespace-nowrap"
                      >
                        詳細
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </details>

            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                下書き（{draftPosts.length}）
              </summary>
              {draftPosts.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">下書きはありません。</p>
              ) : (
                <ul className="divide-y divide-gray-100 mt-2">
                  {draftPosts.map((p) => (
                    <li key={p.id} className="py-2 flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{p.title}</div>
                        <StatusBadge status={p.publishedStatus} />
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/posts/${p.id}`)}
                        className="btn btn-outline btn-sm ml-3 whitespace-nowrap"
                      >
                        詳細
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </div>
        )}
      </section>
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
