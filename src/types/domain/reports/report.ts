// front/src/shared/types/domain/reports/report.ts
import type { PublishedStatus } from "../../prisma";
import type { ReportStatus } from "./status";

export type ReportItem = {
  id: string;
  postId: string;
  postTitle: string;
  postPublishedStatus?: PublishedStatus | null;

  creatorName: string;

  reporterId: string;
  reporterEmail: string;

  reason?: string | null;

  status: ReportStatus; // ✅ string から修正
  createdAt: string;
};
