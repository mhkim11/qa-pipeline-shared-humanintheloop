import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { SUBSCRIPTION_QUERY_KEY, fetchCancelSubscription } from '@/apis';
import { TCancelSubscriptionOutput } from '@/apis/type';

type TUseCancelSubscriptionOptions = {
  onSuccess?: (data: TCancelSubscriptionOutput) => void;
  onError?: (mutationError: AxiosError) => void;
};

/**
 * * 구독 취소 react-query mutation hook
 * @param {TUseCancelSubscriptionOptions} options - 성공/실패 콜백 함수
 * @returns mutation 객체
 */
export const useCancelSubscription = ({ onSuccess, onError }: TUseCancelSubscriptionOptions = {}): {
  mutate: (subscriptionId: string) => void;

  error: AxiosError | null;
} => {
  const queryClient = useQueryClient();

  const { mutate, error } = useMutation<TCancelSubscriptionOutput, AxiosError, string>({
    mutationFn: (subscriptionId: string) => fetchCancelSubscription(subscriptionId),
    onSuccess: (data) => {
      // 구독 목록 쿼리 무효화하여 최신 데이터로 업데이트
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_QUERY_KEY.GET_SUBSCRIPTIONS] });
      onSuccess?.(data);
    },
    onError: (mutationError) => {
      console.error('Cancel subscription error:', mutationError);
      onError?.(mutationError);
    },
  });

  return { mutate, error };
};
