export type ApiListLike<T = any> =
  | T[]
  | {
      items?: T[];
      data?: T[];
      list?: T[];
      results?: T[];
      posts?: T[];
      creators?: T[];
    }
  | null
  | undefined;

export function normalizeList<T = any>(input: ApiListLike<T>): T[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  const obj = input as any;

  const arr =
    obj.items ??
    obj.data ??
    obj.list ??
    obj.results ??
    obj.posts ??
    obj.creators;

  return Array.isArray(arr) ? arr : [];
}
