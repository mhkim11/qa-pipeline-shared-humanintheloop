import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { PAYMENT_QUERY_KEY, fetchGetCurrentPlan } from '@/apis/payment-api';
import type { TGetCurrentPlanOutput } from '@/apis/type/payment.type';

export const useGetCurrentPlan = (): UseQueryResult<TGetCurrentPlanOutput, Error> => {
  return useQuery<TGetCurrentPlanOutput, Error>({
    queryKey: [PAYMENT_QUERY_KEY.GET_CURRENT_PLAN],
    queryFn: fetchGetCurrentPlan,
  });
};
