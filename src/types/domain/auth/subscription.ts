// front/src/shared/types/domain/auth/subscription.ts
import type { SubStatus } from "../../prisma";

export interface StripeSubscription {
  id: string;
  planName: string;
  nextBillingDate?: string | null;
  status: SubStatus;
}
