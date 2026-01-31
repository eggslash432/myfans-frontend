// front/src/pages/admin/_audit/useAuditLogsQuery.ts

export type AuditLogsUiState = {
  take: number;
  cursor: number | null;
  action: string;

  actorId: string;
  targetType: string;
  targetId: string;

  actorQ: string;
  targetQ: string;
};

export function buildAuditLogsQuery(s: AuditLogsUiState) {
  return {
    take: s.take,
    cursor: s.cursor,
    action: s.action.trim() || undefined,

    actorId: s.actorId.trim() || undefined,
    targetType: s.targetType.trim() || undefined,
    targetId: s.targetId.trim() || undefined,

    actorQ: s.actorQ.trim() || undefined,
    targetQ: s.targetQ.trim() || undefined,
  };
}
