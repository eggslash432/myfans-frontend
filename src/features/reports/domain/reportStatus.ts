// front/src/features/reports/domain/reportStatus.ts

export function isDone(status?: string | null) {
  return status === "reviewed" || status === "dismissed";
}
