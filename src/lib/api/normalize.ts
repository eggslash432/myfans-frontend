// front/src/lib/api/normalize.ts
export function unwrapData<T>(res: any): T {
  return (res && typeof res === "object" && "data" in res) ? (res.data as T) : (res as T);
}
