// src/lib/http.ts
export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const res = await fetch(`${base}${path}`, {
    ...init,
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const res = await fetch(`${base}${path}`, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
