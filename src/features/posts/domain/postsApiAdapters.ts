//
export function unwrapPost(post: any) {
  return post?.data ?? post?.post ?? post;
}

export function toArrayUploaded(res: any): any[] {
  // uploadPostMedia の戻りがブレても吸収
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return [res];
}