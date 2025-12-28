// front/src/shared/utils/media.ts

import { API_ORIGIN } from "@/lib/api";
import type { AssetLike, MediaPreview } from "../types";

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

export function resolveMediaUrl(url: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_ORIGIN) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
}

export function recalcIsSample(previews: MediaPreview[], idx: number | null) {
  return previews.map((p, i) => ({ ...p, isSample: idx !== null && i === idx }));
}