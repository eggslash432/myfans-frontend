// front/src/lib/axiosLike.ts

import { request } from './apiClient';

export const apiGet = <T>(path: string) =>
  request<T>(path).then((data) => ({ data }));

export const apiPost = <T>(path: string, body?: any, json = true) =>
  request<T>(path, { method: 'POST', body, json }).then((data) => ({ data }));

export const apiPatch = <T>(path: string, body?: any) =>
  request<T>(path, { method: 'PATCH', body }).then((data) => ({ data }));

export const apiDelete = <T>(path: string) =>
  request<T>(path, { method: 'DELETE' }).then((data) => ({ data }));

