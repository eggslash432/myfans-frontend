// front/src/hooks/usePlans.ts

import { useQuery } from '@tanstack/react-query';
import { getMyPlans } from '@/lib/api';
import type { PlansResponse } from '@/shared';

// 自分のプラン
export function useMyPlans() {
  return useQuery<PlansResponse>({
    queryKey: ['plans', 'me'],
    queryFn: () => getMyPlans(),
  });
}
