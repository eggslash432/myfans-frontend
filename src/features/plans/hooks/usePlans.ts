// front/src/hooks/usePlans.ts

import { useQuery } from '@tanstack/react-query';
import type { PlansResponse } from '@/shared';
import { getMyPlans } from '../api';

// 自分のプラン
export function useMyPlans() {
  return useQuery<PlansResponse>({
    queryKey: ['plans', 'me'],
    queryFn: () => getMyPlans(),
  });
}
