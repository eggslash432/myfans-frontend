// front/src/pages/posts/postDetail/SampleSection.tsx
import { resolveMediaUrl } from '@/features/media';
import type { SampleAsset } from '@/types';
import React from 'react';

type Props = {
  visible: boolean;
  sampleAssets: SampleAsset[];
  sampleLimitSec: number;
  isLocked: (key: string) => boolean;
  onPlay: (key: string) => void;
  onTimeUpdate: (key: string, e: React.SyntheticEvent<HTMLVideoElement>) => void;
};

export function SampleSection({
  visible,
  sampleAssets,
  sampleLimitSec,
  isLocked,
  onPlay,
  onTimeUpdate,
}: Props) {
  if (!visible || sampleAssets.length === 0) return null;

  return (
    <section className="space-y-2 mb-4">
      <div className="post-detail-badge post-detail-badge-free">
        🎬 サンプル動画（最大{sampleLimitSec}秒）
      </div>

      <div className="space-y-3">
        {sampleAssets.map((asset, idx) => {
          const src = resolveMediaUrl(asset.url);
          const key = (asset.id ?? `sample-${idx}`).toString();
          const locked = isLocked(key);

          return (
            <div key={key} className="w-full">
              <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                <video
                  src={src}
                  controls
                  className="post-media"
                  onPlay={() => onPlay(key)}
                  onTimeUpdate={(e) => onTimeUpdate(key, e)}
                />
              </div>

              <div className="mt-1 text-xs text-gray-600">
                ※ サンプルは {sampleLimitSec} 秒で自動停止します
              </div>

              {locked && (
                <div className="mt-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
                  サンプル視聴は {sampleLimitSec} 秒までです。続きは購入 / 購読してください。
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
