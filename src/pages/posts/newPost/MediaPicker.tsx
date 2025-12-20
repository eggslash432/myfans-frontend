// front/src/pages/posts/newPost/MediaPicker.tsx

import React from 'react';
import type { MediaPreview } from './helpers';

type Props = {
  mediaFilesCount: number;
  mediaPreviews: MediaPreview[];
  sampleMediaIndex: number | null;

  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPickClick: () => void;
  onClearAll: () => void;
  onChangeFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;

  hasVideo: boolean;
  sampleSelected: boolean;
  onClearSample: () => void;
  onSelectSample: (i: number) => void;
};

export function MediaPicker({
  mediaFilesCount,
  mediaPreviews,
  sampleMediaIndex,
  fileInputRef,
  onPickClick,
  onClearAll,
  onChangeFiles,
  hasVideo,
  sampleSelected,
  onClearSample,
  onSelectSample,
}: Props) {
  return (
    <div className="form-field">
      <label className="form-label">メディア（画像・動画・音声）</label>

      <div className="flex items-center gap-3">
        <button type="button" className="btn btn-secondary" onClick={onPickClick}>
          ファイルを選択
        </button>

        {mediaFilesCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm text-red-600" onClick={onClearAll}>
            すべて削除
          </button>
        )}

        {mediaFilesCount > 0 && (
          <span className="text-sm text-gray-600">{mediaFilesCount} 件選択中</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={onChangeFiles}
      />

      {hasVideo && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClearSample}
            disabled={!sampleSelected}
          >
            サンプルなし（指定しない）
          </button>
          <span className="text-xs text-gray-500">
            ※ サンプル指定は任意です（未指定でも投稿できます）
          </span>
        </div>
      )}

      {mediaPreviews.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {mediaPreviews.map((p, i) => (
            <div
              key={i}
              className="w-full max-h-[70vh] bg-black/5 rounded-2xl overflow-hidden flex flex-col items-center justify-start"
            >
              <div className="w-full flex-1 flex items-center justify-center">
                {p.kind === 'image' && <img src={p.url} alt="" className="post-media" />}
                {p.kind === 'video' && <video src={p.url} className="post-media" muted controls />}
                {p.kind === 'audio' && <audio src={p.url} controls className="w-full" />}
              </div>

              {p.kind === 'video' && (
                <label className="w-full px-2 py-1 flex items-center gap-1 text-[11px] border-t border-gray-200 bg-white/80">
                  <input
                    type="radio"
                    name="sampleMedia"
                    checked={sampleMediaIndex === i}
                    onChange={() => onSelectSample(i)}
                  />
                  <span>この動画をサンプルとして表示する</span>
                </label>
              )}

              {p.kind === 'video' && p.isSample && (
                <div className="w-full px-2 py-1 text-[11px] text-green-700 bg-green-50 border-t border-green-200">
                  ✅ サンプルに設定中
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-gray-500">
        ※ 投稿ボタンを押すと、本文と一緒に選択中のメディアもアップロードされます。
        （動画を選択した場合、任意で 1つを「サンプル動画」として指定できます）
      </p>
    </div>
  );
}
