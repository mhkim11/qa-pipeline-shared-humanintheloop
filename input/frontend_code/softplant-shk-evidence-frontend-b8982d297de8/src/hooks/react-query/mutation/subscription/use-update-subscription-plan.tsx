import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchUpdateSubscriptionPlan } from '@/apis/subscription-api';
import { TUpdateSubscriptionPlanInput, TUpdateSubscriptionPlanOutput } from '@/apis/type/subscription.type';

type TUseUpdateSubscriptionPlanInput = {
  planId: string;
  input: TUpdateSubscriptionPlanInput;
};

type TUseUpdateSubscriptionPlanOutput = {
  mutate: (data: TUseUpdateSubscriptionPlanInput) => void;
  isLoading: boolean;
  error: AxiosError | null;
};

/**
 * 구독 플랜 수정 react-query mutation hook
 * @param {object} options - mutation 옵션
 * @param {function} options.onSuccess - 성공 콜백
 * @param {function} options.onError - 실패 콜백
 * @returns {TUseUpdateSubscriptionPlanOutput} 구독 플랜 수정 mutation
 */
export const useUpdateSubscriptionPlan = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TUpdateSubscriptionPlanOutput) => void;
  onError?: (error: AxiosError) => void;
} = {}): TUseUpdateSubscriptionPlanOutput => {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending: isLoading,
    error,
  } = useMutation<TUpdateSubscriptionPlanOutput, AxiosError, TUseUpdateSubscriptionPlanInput>({
    mutationFn: ({ planId, input }) => fetchUpdateSubscriptionPlan(planId, input),
    onSuccess: (data) => {
      // 플랜 목록과 상세 정보 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLANS] });
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLAN_DETAIL] });
      onSuccess?.(data);
    },
    onError: (err) => {
      console.error('Update Plan Error:', err);
      onError?.(err);
    },
  });

  return { mutate, isLoading, error: error || null };
};
