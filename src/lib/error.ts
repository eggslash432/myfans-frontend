// front/src/lib/error.ts
import { ApiError } from "@/lib/api"; // 実体の場所に合わせて

export function normalizeMsg(msg: unknown): string {
  if (!msg) return "";
  if (Array.isArray(msg)) return msg.map(String).join("\n");
  if (typeof msg === "string") return msg;
  return String(msg);
}

export function getErrMsg(e: unknown): string {
  if (!e) return "";
  if (e instanceof ApiError) {
    const m = normalizeMsg((e as any).body?.message);
    return m || String(e.message ?? "");
  }
  if (e instanceof Error) return e.message;
  return String(e);
}
