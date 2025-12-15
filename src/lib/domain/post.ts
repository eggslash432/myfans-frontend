// front/src/lib/domain/post.ts
import type { PostDetail } from '../../shared/types';

export function normalizePostDetail(raw: any): PostDetail {
  if (!raw) return raw;
  if (raw.visibility === 'free') {
    return {
      ...raw,
      isLocked: false,
      canView: true,
    };
  }
  return raw;
}