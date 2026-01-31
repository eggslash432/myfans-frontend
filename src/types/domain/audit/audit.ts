// front/src/types/domain/audit/audit.ts

export type AuditLogRow = {
  id: number;
  createdAt: string;
  actorId: string;
  actorRole: string | null;
  action: string;
  target: string | null;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  userAgent: string | null;
  meta: any;
};

export type AuditLogsQuery = {
  take?: number;
  cursor?: number | null;
  action?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  from?: string; // ISO
  to?: string;   // ISO
  actorQ?: string;
  targetQ?: string;  
};

export type AuditLogsResponse = {
  rows: AuditLogRow[];
  nextCursor: number | null;
};
