// front/src/shared/utils/date.ts

export function fmtDate(iso: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}