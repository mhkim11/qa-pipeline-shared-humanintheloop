import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchGetSubscriptionPlans } from '@/apis/subscription-api';
import { TGetSubscriptionPlansInput, TGetSubscriptionPlansOutput } from '@/apis/type/subscription.type';

type TUseGetSubscriptionPlansOutput = {
  response: TGetSubscriptionPlansOutput | undefined;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * 구독 플랜 목록 조회 react-query query hook
 * @param {TGetSubscriptionPlansInput} input - 플랜 목록 조회 파라미터
 * @returns {TUseGetSubscriptionPlansOutput} 구독 플랜 목록 조회 결과
 */
export const useGetSubscriptionPlans = (input: TGetSubscriptionPlansInput): TUseGetSubscriptionPlansOutput => {
  const {
    data: response,
    error,
    isFetching: _isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetSubscriptionPlansOutput, AxiosError>({
    queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLANS, input],
    queryFn: () => fetchGetSubscriptionPlans(input),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: 'always',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error: error || null, refetch, isLoading };
};
