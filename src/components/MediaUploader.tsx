// src/components/MediaUploader.tsx
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

  return (
    <div className="space-y-2 border rounded p-4">
      <div className="font-semibold">メディアアップロード</div>

      <input
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          {files.map((f, i) => (
            <li key={i}>
              {f.name} ({Math.round(f.size / 1024)} KB)
            </li>
          ))}
        </ul>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        type="button"
        onClick={handleUploadClick}
        disabled={isUploading || !files.length}
        className="px-3 py-1.5 rounded bg-blue-600 disabled:bg-gray-400 text-white text-sm"
      >
        {isUploading ? 'アップロード中...' : 'アップロード'}
      </button>

      {/* 簡易プレビュー（画像だけ） */}
      {files.some((f) => f.type.startsWith('image/')) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files
            .filter((f) => f.type.startsWith('image/'))
            .map((f, i) => (
              <img
                key={i}
                src={URL.createObjectURL(f)}
                alt={f.name}
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
        </div>
      )}
    </div>
  );
}
