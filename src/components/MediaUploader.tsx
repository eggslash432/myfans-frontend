// front/src/components/MediaUploader.tsx

import React, { useState } from 'react';
import { uploadMultiplePostMedia } from '../lib/media';
import type { PostMedia } from '../lib/media';

type Props = {
  postId: string;
  onUploaded?: (media: PostMedia[]) => void;
};

export default function MediaUploader({ postId, onUploaded }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setError(null);
  };

  const handleUploadClick = async () => {
    if (!files.length || isUploading) return;

    try {
      setIsUploading(true);
      setError(null);

      const mediaList = await uploadMultiplePostMedia(postId, files);

      setFiles([]);
      onUploaded?.(mediaList);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : 'アップロードに失敗しました');
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const hasImage = files.some((f) => f.type.startsWith('image/'));

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">メディアアップロード</div>
      <p className="text-xs text-gray-500">
        画像や動画をアップロードすると、この投稿に紐づくメディアとして表示されます。
      </p>

      {/* ファイル選択 ＋ アップロードボタン */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        {/* 実際の input は隠して、見た目はボタンに */}
        <input
          id="media-files-input"
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
          style ={{ display: 'none' }}
        />
        <label
          htmlFor="media-files-input"
          className="btn btn-outline w-full sm:w-auto justify-center cursor-pointer"
        >
          ファイルを選択
        </label>

        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading || !files.length}
          className={`
            btn btn-primary w-full sm:w-auto justify-center
            ${(!files.length || isUploading) ? 'opacity-60 cursor-not-allowed shadow-none' : ''}
          `}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span
                className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"
              />
              アップロード中…
            </span>
          ) : (
            <>
              {/* ↑アイコン */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              <span>アップロード</span>
            </>
          )}
        </button>
      </div>

      {/* 選択中ファイルの一覧 */}
      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="text-xs text-gray-500 mb-1">
            選択中のファイル（{files.length}件）
          </div>
          <ul className="text-xs text-gray-700 space-y-1">
            {files.map((f, i) => (
              <li key={i}>
                {f.name}（{Math.round(f.size / 1024)} KB）
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* 簡易プレビュー（画像だけ） */}
      {hasImage && (
        <div className="mt-1 flex flex-wrap gap-2">
          {files
            .filter((f) => f.type.startsWith('image/'))
            .map((f, i) => (
              <div
                key={i}
                className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              >
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
