// front/src/features/auth/api/session.ts
import { request } from "@/lib/api";

type AuthTokenRes = { access_token?: string };

function saveTokenIfAny(data?: AuthTokenRes) {
  if (data?.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
}

export async function login(payload: { email: string; password: string }) {
  const data = await request<AuthTokenRes>("/auth/login", {
    method: "POST",
    body: payload,
  });
  saveTokenIfAny(data);
  return data;
}

// ✅ role は送らない（サーバが決める）
export async function signup(payload: { email: string; password: string }) {
  const data = await request<AuthTokenRes>("/auth/signup", {
    method: "POST",
    body: payload,
  });
  saveTokenIfAny(data);
  return data;
}

export async function logout() {
  await request("/auth/logout", { method: "POST" });
  localStorage.removeItem("access_token");
}
