// front/src/lib/api/users.ts

import { request } from "./apiClient";

// front/src/lib/api/users.ts
export function changePassword(input: {
  oldPassword: string;
  newPassword: string;
}) {
  return request<{ ok: true }>('/users/password', {
    method: 'PATCH',
    body: input,
  });
}
