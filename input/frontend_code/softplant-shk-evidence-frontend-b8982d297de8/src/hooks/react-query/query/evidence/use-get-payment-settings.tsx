import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchGetPaymentSettings } from '@/apis';
import { TGetPaymentSettingsOutput } from '@/apis/type';

type TUseGetPaymentSettingsOutput = {
  response: TGetPaymentSettingsOutput | undefined;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 결제 설정 조회 react-query query hook
 * @returns {TUseGetPaymentSettingsOutput} 결제 설정 조회 결과
 */
export const useGetPaymentSettings = (): TUseGetPaymentSettingsOutput => {
  const {
    data: response,
    error,
    isFetching: _isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetPaymentSettingsOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.GET_PAYMENT_SETTINGS],
    queryFn: () => fetchGetPaymentSettings(),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: 'always',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error: error || null, refetch, isLoading };
};
