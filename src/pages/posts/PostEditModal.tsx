// front/src/pages/posts/PostEditModal.tsx
import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import type { PublishedStatus, Visibility } from '../../shared/prisma-enums';
import type { PostProps } from '../../shared/types';
import { useAuth } from '../../hooks/useAuth';

export function PostEditModal({
  post,
  open,
  saving,
  onClose,
  onSubmit,
  onAddMedia,
  onRemoveMedia,
}: PostProps) {
  const { user } = useAuth();

  const isAdminAccount =
    user?.role === 'admin' || user?.role === 'sub_admin';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('free');
  const [priceJpy, setPriceJpy] = useState<number | null>(null);
  const [status, setStatus] = useState<PublishedStatus>('draft');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ===== post 初期化 =====
  useEffect(() => {
    if (!post) return;

    const p = (post as any).data ?? (post as any).post ?? post;

    setTitle(p.title ?? '');
    setBody(p.body ?? '');

    let v = (p.visibility as Visibility) ?? 'free';
    if (isAdminAccount && v === 'paid_single') {
      v = 'plan';
    }
    setVisibility(v);

    setPriceJpy(p.priceJpy ?? null);

    const ps = String(p.publishedStatus ?? 'draft') as PublishedStatus;
    setStatus(
      ps === 'published'
        ? 'published'
        : ps === 'private'
        ? 'private'
        : 'draft',
    );
  }, [post, isAdminAccount]);

  if (!open || !post) return null;

  const rawPost = (post as any).data ?? (post as any).post ?? post;

  // ★ 公開済み判定（超重要）
  const isPublished = rawPost.publishedStatus === 'published';

  // ===== 保存 =====
  const handleSaveClick = () => {
    const payload: any = {
      title,
      body,
      publishedStatus: status,
    };

    // ★ 公開前だけ販売条件を送る
    if (!isPublished) {
      payload.visibility = visibility;
      payload.priceJpy =
        visibility === 'paid_single' ? (priceJpy ?? 0) : null;
    }

    onSubmit(payload);
  };

  // ===== メディア追加 =====
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    onAddMedia(e.target.files);
    e.target.value = '';
  };

  const mediaAssets =
    rawPost.mediaAssets ?? rawPost.media ?? rawPost.medias ?? [];

  const visibilityLabel =
    visibility === 'free'
      ? '無料'
      : visibility === 'plan'
      ? 'プラン限定'
      : 'PPV（単品販売）';

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        {/* ===== ヘッダー ===== */}
        <div className="modal-header">
          <div>
            <div className="modal-title">投稿を編集</div>
            <div className="modal-subtitle">ID: {rawPost.id}</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* ===== 本体 ===== */}
        <div className="modal-body">
          {/* タイトル */}
          <div>
            <div className="modal-label">タイトル</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />
          </div>

          {/* 本文 */}
          <div>
            <div className="modal-label">本文</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="modal-textarea"
              rows={4}
            />
          </div>

          {/* ===== メディア ===== */}
          <div className="space-y-1">
            <div className="text-sm font-medium">添付メディア</div>

            {mediaAssets.length === 0 ? (
              <div className="text-xs text-gray-500">
                まだメディアは添付されていません。
              </div>
            ) : (
              <div className="modal-media-list">
                {mediaAssets.map((m: any) => {
                  const mediaType = String(
                    m.type ?? m.mediaType ?? '',
                  ).toLowerCase();

                  return (
                    <div key={m.id ?? m.url} className="modal-media-item">
                      {mediaType === 'image' && (
                        <img src={m.url} className="modal-media-thumb" />
                      )}
                      {mediaType === 'video' && (
                        <video src={m.url} controls className="modal-media-video" />
                      )}
                      {mediaType === 'audio' && (
                        <audio src={m.url} controls className="modal-media-audio" />
                      )}

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm modal-media-remove"
                        onClick={() => m.id && onRemoveMedia(m.id)}
                        disabled={saving}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* メディア追加 */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              ＋ メディアを追加
            </button>
          </div>

          {/* ===== 公開タイプ ===== */}
          <div>
            <div className="modal-label">公開タイプ</div>
            <select
              value={visibility}
              disabled={isPublished}
              onChange={(e) =>
                setVisibility(e.target.value as Visibility)
              }
              className="modal-select"
            >
              <option value="free">無料</option>
              {!isAdminAccount && (
                <>
                  <option value="plan">プラン限定</option>
                  <option value="paid_single">PPV</option>
                </>
              )}
            </select>

            {isPublished && (
              <div className="text-xs text-gray-500 mt-1">
                ※ 公開後は販売条件（公開タイプ・価格）は変更できません
              </div>
            )}
          </div>

          {/* 価格 */}
          {!isAdminAccount &&
            visibility === 'paid_single' &&
            !isPublished && (
              <div>
                <div className="modal-label">価格（円）</div>
                <input
                  type="number"
                  className="modal-input"
                  value={priceJpy ?? ''}
                  onChange={(e) =>
                    setPriceJpy(
                      e.target.value === '' ? null : Number(e.target.value)
                    )
                  }
                />
              </div>
            )}

          {/* 公開ステータス */}
          <div>
            <div className="modal-label">公開ステータス</div>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as PublishedStatus)
              }
              className="modal-select"
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
              <option value="private">非公開</option>
            </select>
          </div>
        </div>

        {/* ===== フッター ===== */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={saving}
          >
            キャンセル
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveClick}
            disabled={saving}
          >
            {saving ? '保存中…' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  );
}
