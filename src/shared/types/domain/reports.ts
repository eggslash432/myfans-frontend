import type { PublishedStatus } from "../prisma-enums";

// front/src/shared/types/reports.ts
export type ReportItem = {
  id: string;
  postId: string;
  postTitle: string;
  postPublishedStatus?: PublishedStatus | null;
  creatorName: string;
  reporterId: string;
  reporterEmail: string;
  reason?: string | null;
  status: string;
  createdAt: string;
};



