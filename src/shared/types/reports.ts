// front/src/shared/types/reports.ts
export type ReportItem = {
  id: string;
  postId: string;
  postTitle: string;
  creatorName: string;
  reporterId: string;
  reporterEmail: string;
  reason?: string | null;
  status: string;
  createdAt: string;
};

