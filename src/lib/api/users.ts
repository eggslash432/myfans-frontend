// front/src/lib/api/users.ts

import { request } from "./apiClient";
import type { MeSummary } from "../../shared/types";

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

export function getUserMe(): Promise<MeSummary> {
  return request<MeSummary>("/users/me");
}
