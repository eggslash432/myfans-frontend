// front/src/pages/posts/postDetail/resolveMediaUrl.ts
import { API_ORIGIN } from '../../../lib/api';

export function resolveMediaUrl(url: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_ORIGIN) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
}