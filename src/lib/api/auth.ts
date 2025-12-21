// front/src/lib/api/auth.ts
import { request } from './apiClient';
import type { Me, MeSummary } from '../../shared/types';

export function getMe(): Promise<Me> {
  return request<Me>('/auth/me');
}

export function getUserMe(): Promise<MeSummary> {
  return request<MeSummary>('/auth/me/summary');
}

export async function login(payload: { email: string; password: string }) {
  const data = await request<{ access_token?: string }>('/auth/login', {
    method: 'POST',
    body: payload,
  });

  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

// ✅ role を送らない（サーバが決める）
export async function signup(payload: { email: string; password: string }) {
  const data = await request<{ access_token?: string }>('/auth/signup', {
    method: 'POST',
    body: payload,
  });

  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' });
  localStorage.removeItem('access_token');
}
