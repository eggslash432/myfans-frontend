// front/src/shared/types/domain/creators/application.ts
import type { CreatorApprovalStatus } from "../../prisma";

export type CreatorApplication = {
  userId: string;
  email: string;
  displayName: string | null;
  publicName: string;
  createdAt: string;
  updatedAt: string;

  approvalStatus: CreatorApprovalStatus;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;

  applicationCount?: number;
  lastAppliedAt?: string | null;
};
