// front/src/lib/api/users.ts
import { request } from "@/lib/api";

export function changePassword(input: {
  oldPassword: string;
  newPassword: string;
}) {
  return request<{ ok: true }>('/users/me/password', {
    method: 'PATCH',
    body: {
      currentPassword: input.oldPassword, // ✅ APIが期待するキーに合わせる
      newPassword: input.newPassword,
    },
  });
}
