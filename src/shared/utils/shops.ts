//front/src/shared/utils/shopUtils.ts
import { ApiError } from "@/lib/api";

export function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(n);
}

export function getErrorMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof ApiError) {
    const msg = (err.body?.message ?? err.message ?? "") as string;
    return String(msg);
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export function getStatus(err: unknown): number | null {
  if (!err) return null;
  if (err instanceof ApiError) {
    // apiClient の実装次第で err.status or err.response.status の場合がある
    const s = (err as any).status ?? (err as any).response?.status ?? null;
    return typeof s === "number" ? s : null;
  }
  return null;
}

