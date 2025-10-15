import { atom } from "jotai";
export const authAtom = atom<{token?:string; user?:any}>({});
// クッキーからアクセストークンを取得（SSR/CSR両対応の簡易版）
export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;)\s*access_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
