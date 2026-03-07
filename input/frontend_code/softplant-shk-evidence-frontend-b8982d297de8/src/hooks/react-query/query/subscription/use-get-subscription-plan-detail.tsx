import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchGetSubscriptionPlanDetail } from '@/apis/subscription-api';
import { TGetSubscriptionPlanDetailOutput } from '@/apis/type/subscription.type';

type TUseGetSubscriptionPlanDetailOutput = {
  response: TGetSubscriptionPlanDetailOutput | undefined;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * 구독 플랜 상세 조회 react-query query hook
 * @param {string} planId - 플랜 ID
 * @param {boolean} enabled - 쿼리 활성화 여부
 * @returns {TUseGetSubscriptionPlanDetailOutput} 구독 플랜 상세 조회 결과
 */
export const useGetSubscriptionPlanDetail = (planId: string, enabled = true): TUseGetSubscriptionPlanDetailOutput => {
  const {
    data: response,
    error,
    refetch,
    isLoading,
  } = useQuery<TGetSubscriptionPlanDetailOutput, AxiosError>({
    queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLAN_DETAIL, planId],
    queryFn: () => fetchGetSubscriptionPlanDetail(planId),
    enabled: enabled && !!planId,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: 'always',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error: error || null, refetch, isLoading };
};
