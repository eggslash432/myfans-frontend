// front/src/shared/types/auth.ts
import type { Role, SubStatus } from "../prisma-enums";

export type User = {
  id: string;
  email: string;
  nickname?: string;
  role: Role;
  creatorId?: number | null;
};

export interface Subscription {
  id: string;
  planName: string;
  nextBillingDate?: string | null;
  status: SubStatus;
}

export interface AuthMe {
  id: string;
  nickname?: string | null;
  email: string;
  subscription?: Subscription | null;
}
