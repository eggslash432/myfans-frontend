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
  const { user } = useAuth();  // ★ 追加
  const isAdminAccount =
    user?.role === 'admin' || user?.role === 'sub_admin';  // ★ 追加

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('free');
  const [priceJpy, setPriceJpy] = useState<number | null>(null);
  const [status, setStatus] = useState<PublishedStatus>('draft');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // post が null のときは何もしない
  useEffect(() => {
    if (!post) return;

    // ★ { data: {...} } / { post: {...} } / {...} どれでもOKにする
    const p = (post as any).data ?? (post as any).post ?? post;

    setTitle(p.title ?? '');
    setBody(p.body ?? '');

    // ★ 管理者アカウントで PPV は選択させない
    let v = (p.visibility as Visibility) ?? 'free';
    if (isAdminAccount && v === 'paid_single') {
      v = 'plan'; // admin で PPV 投稿を編集するときはプラン扱いに寄せる
    }
    setVisibility(v);
    setPriceJpy(p.priceJpy ?? null);

    const ps = String(p.publishedStatus ?? 'draft') as PublishedStatus;
    setStatus(
      ps === 'published' ? 'published' :
      ps === 'private'   ? 'private'   :
                           'draft',
    );
  }, [post, isAdminAccount]);

  if (!open || !post) return null;

  // ここも同じく「中身だけ」にそろえる
  const rawPost = (post as any).data ?? (post as any).post ?? post;

  const handleSaveClick = () => {
    onSubmit({
      title,
      body,
      visibility,
      priceJpy: visibility === 'paid_single' ? (priceJpy ?? 0) : null,
      publishedStatus: status,
    });
  };

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
        {/* ヘッダー */}
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

        {/* 本文 */}
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

          {/* メディア */}
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
                    m.type ?? m.mediaType ?? m.fileType ?? '',
                  ).toLowerCase();
                  const mime = String(
                    m.mimeType ?? m.contentType ?? '',
                  ).toLowerCase();

                  const isImage =
                    mediaType === 'image' || mime.startsWith('image/');
                  const isVideo =
                    mediaType === 'video' || mime.startsWith('video/');
                  const isAudio =
                    mediaType === 'audio' || mime.startsWith('audio/');

                  return (
                    <div key={m.id ?? m.url} className="modal-media-item">
                      {/* プレビュー本体 */}
                      {isImage && (
                        <button
                          type="button"
                          className="modal-media-thumb-btn"
                          onClick={() => window.open(m.url, '_blank')}
                          title="クリックで別タブで開く"
                        >
                          <img
                            src={m.url}
                            alt={m.filename ?? ''}
                            className="modal-media-thumb"
                          />
                        </button>
                      )}

                      {isVideo && (
                        <video
                          className="modal-media-video"
                          src={m.url}
                          controls
                        />
                      )}

                      {isAudio && (
                        <div className="modal-media-audio-wrapper">
                          <div className="modal-media-audio-label">音声</div>
                          <audio className="modal-media-audio" controls>
                            <source src={m.url} type={mime || 'audio/mpeg'} />
                            ブラウザが audio タグに対応していません。
                          </audio>
                        </div>
                      )}

                      {!isImage && !isVideo && !isAudio && (
                        <div className="modal-media-icon">
                          <div className="modal-media-emoji">📎</div>
                          <div className="modal-media-label">ファイル</div>
                        </div>
                      )}

                      {/* 削除ボタン */}
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

            {/* ▼ ここが「メディアを追加」ボタン */}
            <div className="mt-2 flex flex-col gap-1">
              {/* 非表示の file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />

              {/* 見た目も挙動もボタン */}
              <button
                type="button"
                className="btn btn-outline btn-sm w-fit"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
              >
                ＋ メディアを追加
              </button>

              <div className="mt-1 text-[11px] text-gray-500">
                画像・動画・音声に対応しています。
              </div>
            </div>
          </div>


          {/* 公開タイプ */}
          <div>
            <div className="modal-label">公開タイプ</div>
            <div className="flex items-center gap-2 mt-1">
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as Visibility)
                }
                className="modal-select"
              >
                <option value="free">無料</option>

                {/* ★ 管理者の場合は plan / PPV を隠す */}
                {!isAdminAccount && (
                  <>
                    <option value="plan">プラン限定</option>
                    <option value="paid_single">PPV（単品販売）</option>
                  </>
                )}            
              </select>
              <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {visibilityLabel}
              </span>
            </div>
          </div>

          {/* 価格（PPV のときだけ） */}
          {!isAdminAccount && visibility === 'paid_single' && (
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

        {/* フッター */}
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
