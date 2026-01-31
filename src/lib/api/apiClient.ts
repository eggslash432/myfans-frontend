// front/src/lib/api/apiClient.ts

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

// 403でこのコードが返ってきたら専用ページへ誘導
const LICENSE_BLOCK_CODE = "BUSINESS_LICENSE_NOT_APPROVED";
const LICENSE_PAGE_PATH = "/shops/me/license";

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any, message?: string) {
    super(message ?? body?.message ?? "API Error");
    this.status = status;
    this.body = body;
  }
}

// RequestInit の body を上書きして、plain object / FormData も受けられるようにする
export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: any;      // objectでもOK
  json?: boolean;  // trueなら JSON.stringify
};

/**
 * D-7（営業許可未承認）で403になった場合に、共通で案内ページへ誘導する。
 * - APIが { code: "BUSINESS_LICENSE_NOT_APPROVED", message: ... } を返す前提
 * - 無限ループ回避のため、すでに案内ページなら遷移しない
 */
function handleLicenseBlockIfNeeded(status: number, data: any) {
  if (status !== 403) return;
  const code = data?.code;
  if (code !== LICENSE_BLOCK_CODE) return;

  // SSRではない前提（Vite/SPA想定）だが念のため
  if (typeof window === "undefined") return;

  const pathNow = window.location.pathname;
  if (pathNow.startsWith(LICENSE_PAGE_PATH)) return;

  // replaceの方が「戻る」で同じエラー画面に戻りにくい
  window.location.replace(LICENSE_PAGE_PATH);
}

export async function request<T = unknown>(
  path: string,
  init: RequestOptions = {},
): Promise<T> {
  const { json = true, headers, body, ...rest } = init;

  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const token = localStorage.getItem("access_token");

  const extraHeaders =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : (headers as Record<string, string> | undefined);

  const finalHeaders: Record<string, string> = {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  };

  // json=true なら object を stringify
  // json=false なら FormData / Blob / string をそのまま流す
  const finalBody =
    json && body != null && typeof body !== "string"
      ? JSON.stringify(body)
      : body;

  const res = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: finalHeaders,
    body: finalBody as BodyInit | null | undefined,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    // ★ 追加：営業許可未承認(403)なら共通で案内ページへ誘導
    handleLicenseBlockIfNeeded(res.status, data);

    if (res.status === 401) {
      localStorage.removeItem("access_token");
    }
    throw new ApiError(res.status, data, data?.message);
  }

  return data as T;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    let data: any = null;

    // fetchJson でも同じく code を見たい場合
    try {
      data = txt ? safeJsonParse(txt) : null;
    } catch {
      data = null;
    }

    // ★ 追加：営業許可未承認(403)なら共通で案内ページへ誘導
    handleLicenseBlockIfNeeded(res.status, data);

    throw new Error(`HTTP ${res.status}: ${txt}`);
  }

  return (await res.json()) as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
