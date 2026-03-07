import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchCreateSubscriptionPlan } from '@/apis/subscription-api';
import { TCreateSubscriptionPlanInput, TCreateSubscriptionPlanOutput } from '@/apis/type/subscription.type';

type TUseCreateSubscriptionPlanOutput = {
  mutate: (data: TCreateSubscriptionPlanInput) => void;
  isLoading: boolean;
  error: AxiosError | null;
};

/**
 * 구독 플랜 생성 react-query mutation hook
 * @param {object} options - mutation 옵션
 * @param {function} options.onSuccess - 성공 콜백
 * @param {function} options.onError - 실패 콜백
 * @returns {TUseCreateSubscriptionPlanOutput} 구독 플랜 생성 mutation
 */
export const useCreateSubscriptionPlan = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TCreateSubscriptionPlanOutput) => void;
  onError?: (error: AxiosError) => void;
} = {}): TUseCreateSubscriptionPlanOutput => {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending: isLoading,
    error,
  } = useMutation<TCreateSubscriptionPlanOutput, AxiosError, TCreateSubscriptionPlanInput>({
    mutationFn: (input) => fetchCreateSubscriptionPlan(input),
    onSuccess: (data) => {
      // 플랜 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_PLANS] });
      onSuccess?.(data);
    },
    onError: (mutationError) => {
      console.error('Create Plan Error:', mutationError);
      onError?.(mutationError);
    },
  });

  return { mutate, isLoading, error: error || null };
};
