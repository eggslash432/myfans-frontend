import { useQuery } from '@tanstack/react-query';
import { getMyPlans, getCreatorPlans, type PlansResponse } from '../lib/api';

// 自分のプラン
export function useMyPlans() {
  return useQuery<PlansResponse>({
    queryKey: ['plans', 'me'],
    queryFn: () => getMyPlans(),
  });
}

// クリエイターのプラン
export function useCreatorPlans(creatorId: string) {
  return useQuery<PlansResponse>({
    queryKey: ['plans', 'creator', creatorId],
    queryFn: () => getCreatorPlans(creatorId),
    enabled: !!creatorId,
  });
}
