// front/src/shared/types/domain/creators/creator.ts
import type { Plan } from "../plans";

export type Creator = {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  plans: Plan[];
};