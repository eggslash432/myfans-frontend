import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Axiosインスタンス作成
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false, // 必要に応じてCookie送信
});

// リクエスト前にアクセストークンを自動付与
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token'); // ← どちらかに統一
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function apiGet(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[apiGet] error', { url, status: res.status, text });
    throw new Error(`GET ${url} -> ${res.status} ${text}`);
  }
  return res.json();
}
 
export async function apiPost(path: string, body?: any, init: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default api;
