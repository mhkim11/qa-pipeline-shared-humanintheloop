import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchDeactivateSubscriptionPlan } from '@/apis/subscription-api';
import { TDeactivateSubscriptionPlanOutput } from '@/apis/type/subscription.type';

type TUseDeactivateSubscriptionPlanOutput = {
  mutate: (planId: string) => void;
  isLoading: boolean;
  error: AxiosError | null;
};

/**
 * 구독 플랜 비활성화 react-query mutation hook
 * @param {object} options - mutation 옵션
 * @param {function} options.onSuccess - 성공 콜백
 * @param {function} options.onError - 실패 콜백
 * @returns {TUseDeactivateSubscriptionPlanOutput} 구독 플랜 비활성화 mutation
 */
export const useDeactivateSubscriptionPlan = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TDeactivateSubscriptionPlanOutput) => void;
  onError?: (error: AxiosError) => void;
} = {}): TUseDeactivateSubscriptionPlanOutput => {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending: isLoading,
    error,
  } = useMutation<TDeactivateSubscriptionPlanOutput, AxiosError, string>({
    mutationFn: (planId) => fetchDeactivateSubscriptionPlan(planId),
    onSuccess: (data) => {
      // 플랜 목록과 상세 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLANS] });
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLAN_DETAIL] });
      onSuccess?.(data);
    },
    onError: (err) => {
      console.error('Deactivate Plan Error:', err);
      onError?.(err);
    },
  });

  return { mutate, isLoading, error: error || null };
};
