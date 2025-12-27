// front/src/pages/posts/postDetail/MediaGallery.tsx
import { 
  resolveMediaUrl,
  isAudio, 
  isVideo,
} from '@/shared';
import type { Asset } from '@/shared';

type Props = {
  assets: Asset[];
};

export function MediaGallery({ assets }: Props) {
  if (assets.length === 0) return null;

  return (
    <div className="space-y-4">
      {assets.map((asset, idx) => {
        const src = resolveMediaUrl(asset.url);
        const key = (asset.id ?? idx).toString();

        return (
          <div key={key} className="w-full flex justify-center">
            {isVideo(asset) ? (
              <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                <video src={src} controls className="post-media" />
              </div>
            ) : isAudio(asset) ? (
              <div className="bg-black/5 rounded-2xl px-4 py-3 w-full flex items-center gap-3">
                <span className="text-sm text-gray-600 whitespace-nowrap">音声</span>
                <audio src={src} controls className="w-full" />
              </div>
            ) : (
              <div className="bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center w-full">
                <img src={src} alt="" className="post-media" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
