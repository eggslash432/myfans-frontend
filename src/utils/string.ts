//front/src/shared/utils/string.ts

export function excerpt(text: string, max = 80) {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "…" : t;
}
