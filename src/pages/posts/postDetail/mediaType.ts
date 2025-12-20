// front/src/pages/posts/postDetail/mediaType.ts
import type { MediaType } from '../../../shared/prisma-enums';

export type AssetLike = {
  url: string;
  mimeType?: string;
  kind?: MediaType | string;
  mediaType?: MediaType | string;
};

export function isVideo(asset: AssetLike) {
  const kind = (asset.kind ?? asset.mediaType ?? '').toString();
  if (kind === 'video') return true;
  if (asset.mimeType?.startsWith?.('video/')) return true;

  const u = asset.url.toLowerCase();
  return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
}

export function isAudio(asset: AssetLike) {
  const kind = (asset.kind ?? asset.mediaType ?? '').toString();
  if (kind === 'audio') return true;
  if (asset.mimeType?.startsWith?.('audio/')) return true;

  const u = asset.url.toLowerCase();
  return (
    u.endsWith('.mp3') ||
    u.endsWith('.wav') ||
    u.endsWith('.m4a') ||
    u.endsWith('.ogg')
  );
}
