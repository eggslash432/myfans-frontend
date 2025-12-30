// front/src/shared/types/domain/me/summary.ts

import type { 
  BillingInterval,
  PaymentStatus,
  SubscriptionStatus,
} from "../../prisma";

export type MeSummary = {
  subscriptions: Array<{
    id: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;

    plan?: {
      id: string;
      name: string;
      priceJpy: number;
      billingInterval: BillingInterval;
    };

    creator?: {
      userId: string;
      publicName: string;
    };
  }>;

  payments: Array<{
    id: string;
    amountJpy: number;
    kind: "subscription" | "one_time";
    paymentStatus: PaymentStatus;
    paidAt?: string | null;
    createdAt: string;

    plan?: { id: string; name: string } | null;
    post?: { id: string; title: string } | null;
    creator?: { userId: string; publicName: string } | null;
  }>;
};
