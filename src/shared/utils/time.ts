//front/src/shared/utils/time.ts

export function toTime(v: any) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}