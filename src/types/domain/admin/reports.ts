// front/src/shared/types/domain/admin/reports.ts

export type AdminReport = {
  id: string;
  status?: string;
  resolved?: boolean;
  reason?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type ResolveResult = {
  ok?: boolean;
  [key: string]: unknown;
};
