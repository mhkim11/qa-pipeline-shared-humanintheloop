import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { PAYMENT_QUERY_KEY, fetchGetPaymentHistory } from '@/apis/payment-api';
import type { TGetPaymentHistoryInput, TGetPaymentHistoryOutput } from '@/apis/type/payment.type';

export const useGetPaymentHistory = (input: TGetPaymentHistoryInput): UseQueryResult<TGetPaymentHistoryOutput, Error> => {
  return useQuery({
    queryKey: [PAYMENT_QUERY_KEY.GET_PAYMENT_HISTORY, input],
    queryFn: () => fetchGetPaymentHistory(input),
    retry: 1,
    // project_id가 있을 때만 API 호출 (결제 내역 탭에서는 project_id가 없어도 호출해야 하므로 조건 제거)
    // enabled: !!input.project_id,
  });
};
