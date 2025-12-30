// front/src/shared/types/domain/auth/me.ts
import type { StripeSubscription } from "./subscription";

export interface AuthMe {
  id: string;
  nickname?: string | null;
  email: string;
  subscription?: StripeSubscription | null;
}

