// front/src/lib/api/apiClient.ts

export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

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
  body?: any;      // ★ ここがポイント（objectでもOK）
  json?: boolean;  // ★ trueなら JSON.stringify
};

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
    // fetch には BodyInit | null | undefined で渡したいので最後に丸める
    body: finalBody as BodyInit | null | undefined,
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data, data?.message);
  }

  return data as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
