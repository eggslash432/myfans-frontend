import axios from 'axios';

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

export default api;
