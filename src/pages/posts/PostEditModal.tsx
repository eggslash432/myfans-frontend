// front/src/pages/mypage/PostEditModal.tsx
import { useEffect, useState } from 'react';
import type { PublishedStatus, Visibility } from '../../shared/prisma-enums';
import type { PostProps } from '../../shared/types';

export function PostEditModal({
  post,
  open,
  saving,
  onClose,
  onSubmit,
}: PostProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('free');
  const [priceJpy, setPriceJpy] = useState<number | null>(null);
  const [status, setStatus] = useState<PublishedStatus>('draft');

  useEffect(() => {
    if (!post) return;
    setTitle(post.title ?? '');
    setBody(post.body ?? '');
    setVisibility((post.visibility as Visibility) ?? 'free');
    setPriceJpy(post.priceJpy ?? null);

    const ps = String(post.publishedStatus ?? 'draft') as PublishedStatus;
    setStatus(
      ps === 'published' ? 'published' :
      ps === 'private'   ? 'private'   :
                           'draft',
    );
  }, [post]);

  if (!open || !post) return null;

  const handleSaveClick = () => {
    onSubmit({
      title,
      body,
      visibility,
      priceJpy: visibility === 'paid_single' ? priceJpy ?? 0 : null,
      publishedStatus: status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title">投稿を編集</div>
          <div className="modal-subtitle">ID: {post.id}</div>
        </div>

        <div className="modal-body">
          <label className="modal-label">
            タイトル
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />
          </label>

          <label className="modal-label">
            本文
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="modal-textarea"
            />
          </label>

          <label className="modal-label">
            公開タイプ
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as Visibility)
              }
              className="modal-select"
            >
              <option value="free">無料</option>
              <option value="plan">プラン限定</option>
              <option value="paid_single">PPV（単品販売）</option>
            </select>
          </label>

          {visibility === 'paid_single' && (
            <label className="modal-label">
              価格（円）
              <input
                type="number"
                min={0}
                value={priceJpy ?? ''}
                onChange={(e) =>
                  setPriceJpy(
                    e.target.value === '' ? null : Number(e.target.value),
                  )
                }
                className="modal-input"
              />
            </label>
          )}

          <label className="modal-label">
            公開ステータス
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
          </label>
        </div>

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
