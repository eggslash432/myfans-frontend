// front/src/lib/api/auth.ts
import { request } from './apiClient';
import type { Me, MeSummary } from '../../shared/types';

export function getMe(): Promise<Me> {
  return request<Me>('/auth/me');
}

/** マイページ用サマリ（旧: getMeSummary / meSummary） */
export function getMeSummary(): Promise<MeSummary> {
  return request<MeSummary>('/auth/me/summary', { method: 'GET' });
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

export async function signup(payload: {
  email: string;
  password: string;
  role?: 'fan' | 'creator';
}) {
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


export function changePassword(input: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  return request<{ ok: true }>("/auth/change-password", {
    method: "PATCH",
    body: input,
  });
}
