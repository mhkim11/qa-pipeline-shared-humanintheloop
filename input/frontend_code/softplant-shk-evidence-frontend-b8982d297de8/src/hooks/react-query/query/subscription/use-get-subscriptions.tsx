import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchGetSubscriptions } from '@/apis';
import { TGetSubscriptionsOutput } from '@/apis/type';

type TUseGetSubscriptionsOutput = {
  response: TGetSubscriptionsOutput | undefined;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 구독 목록 조회 react-query query hook
 * @returns {TUseGetSubscriptionsOutput} 구독 목록 조회 결과
 */
export const useGetSubscriptions = (): TUseGetSubscriptionsOutput => {
  const {
    data: response,
    error,
    isFetching: _isFetching, // Renamed to _isFetching to avoid unused variable warning
    refetch,
    isLoading,
  } = useQuery<TGetSubscriptionsOutput, AxiosError>({
    queryKey: [SUBSCRIPTION_QUERY_KEY.GET_SUBSCRIPTIONS],
    queryFn: () => fetchGetSubscriptions(),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: 'always',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error: error || null, refetch, isLoading };
};
