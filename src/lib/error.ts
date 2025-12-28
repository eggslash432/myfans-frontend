// front/src/lib/error.ts
import { ApiError } from "@/lib/api";

/** unknown を表示用文字列に正規化 */
export function normalizeMsg(msg: unknown): string {
  if (msg == null) return "";
  if (Array.isArray(msg)) return msg.map(String).join("\n");
  if (typeof msg === "string") return msg;
  return String(msg);
}

/** 例外からユーザー表示用メッセージを取り出す（これ1本に統一） */
export function getErrorMessage(err: unknown): string {
  if (!err) return "";

  if (err instanceof ApiError) {
    const bodyMsg = normalizeMsg((err as any).body?.message);
    // body.message が無い/空なら ApiError.message にフォールバック
    return bodyMsg || normalizeMsg(err.message);
  }

  if (err instanceof Error) return normalizeMsg(err.message);

  return normalizeMsg(err);
}

/** ApiError なら HTTP status を返す */
export function getStatus(err: unknown): number | null {
  if (!err) return null;
  if (!(err instanceof ApiError)) return null;

  const s = (err as any).status ?? (err as any).response?.status ?? null;
  return typeof s === "number" ? s : null;
}
