// front/src/shared/types/domain/plans/responses.ts
import type { Plan } from "./plan";

export type PlansResponse = {
  ok: true;
  plans: Plan[];
};
