//front/src/shared/utils/posts.ts

export function unwrapPost(res: any) {
  return res?.data ?? res?.post ?? res;
}

export function toArrayUploaded(res: any): any[] {
  // uploadPostMedia の戻りがブレても吸収
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return [res];
}