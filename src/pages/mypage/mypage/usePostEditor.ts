// front/src/pages/mypage/mypage/usePostEditor.ts
import { useCallback, useState } from 'react';
import {
  deleteMyPostMedia,
  getPost,
  updateMyPost,
  uploadPostMedia,
} from '../../../lib/api';
import type { PublishedStatus } from '../../../shared/prisma-enums';
import type { PostSummary } from '../../../shared/types';

function unwrapPost(res: any) {
  return res?.data ?? res?.post ?? res;
}

function toArrayUploaded(res: any): any[] {
  // uploadPostMedia の戻りがブレても吸収
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return [res];
}

export function usePostEditor(params: {
  onUpdateList: (postId: string, patch: Partial<PostSummary>) => void;
}) {
  const { onUpdateList } = params;

  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const openEdit = useCallback(async (summaryPost: any) => {
    try {
      const res = await getPost(summaryPost.id);
      const full = unwrapPost(res);
      setEditingPost(full);
      setEditOpen(true);
    } catch (e: any) {
      console.error('getPost failed', e);
      alert(e?.message ?? '投稿の取得に失敗しました');
    }
  }, []);

  const closeEdit = useCallback(() => {
    if (saving) return;
    setEditOpen(false);
    setEditingPost(null);
  }, [saving]);

  const submitEdit = useCallback(
    async (payload: {
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

        onUpdateList(editingPost.id, {
          title: payload.title,
          publishedStatus: payload.publishedStatus,
        });

        setEditOpen(false);
        setEditingPost(null);
      } catch (e: any) {
        console.error('updateMyPost failed', e);
        alert(e?.message ?? '投稿の更新に失敗しました');
      } finally {
        setSaving(false);
      }
    },
    [editingPost, onUpdateList],
  );

  const addMedia = useCallback(async (files: FileList) => {
    if (!editingPost) return;

    try {
      const uploaded: any[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadPostMedia(editingPost.id, [file]);
        uploaded.push(...toArrayUploaded(res));
      }

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        return { ...prev, mediaAssets: [...raw, ...uploaded] };
      });
    } catch (e: any) {
      console.error('uploadPostMedia failed', e);
      alert(e?.message ?? 'メディアの追加に失敗しました');
    }
  }, [editingPost]);

  const removeMedia = useCallback(async (mediaId: string) => {
    if (!editingPost) return;
    if (!confirm('このメディアを削除しますか？')) return;

    try {
      await deleteMyPostMedia(editingPost.id, mediaId);

      setEditingPost((prev: any) => {
        if (!prev) return prev;
        const raw = prev.mediaAssets ?? prev.media ?? prev.medias ?? [];
        return { ...prev, mediaAssets: raw.filter((m: any) => m.id !== mediaId) };
      });
    } catch (e: any) {
      console.error('メディア削除失敗', e);
      alert(e?.message ?? 'メディアの削除に失敗しました');
    }
  }, [editingPost]);

  return {
    editingPost,
    editOpen,
    saving,
    openEdit,
    closeEdit,
    submitEdit,
    addMedia,
    removeMedia,
  };
}
