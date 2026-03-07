import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchChangePaymentFunction } from '@/apis/evidence-admin-api';
import { TChangePaymentFunctionInput, TChangePaymentFunctionOutput } from '@/apis/type/evidence-admin.type';

type TUseChangePaymentFunctionOutput = {
  mutate: (input: TChangePaymentFunctionInput) => void;
  mutateAsync: (input: TChangePaymentFunctionInput) => Promise<TChangePaymentFunctionOutput>;
  isPending: boolean;
  error: AxiosError | null;
};

/**
 * 결제기능 사용 on-off react-query mutation hook
 * @param {object} options - mutation 옵션
 * @param {function} options.onSuccess - 성공 콜백
 * @param {function} options.onError - 실패 콜백
 * @returns {TUseChangePaymentFunctionOutput} 결제기능 on-off mutation
 */
export const useChangePaymentFunction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TChangePaymentFunctionOutput) => void;
  onError?: (error: AxiosError) => void;
} = {}): TUseChangePaymentFunctionOutput => {
  // const queryClient = useQueryClient();

  const { mutate, mutateAsync, isPending, error } = useMutation<TChangePaymentFunctionOutput, AxiosError, TChangePaymentFunctionInput>({
    mutationFn: (input) => fetchChangePaymentFunction(input),
    onSuccess: (data) => {
      // 필요시 관련 쿼리 캐시 무효화
      // queryClient.invalidateQueries({ queryKey: ['payment-function'] });
      onSuccess?.(data);
    },
    onError: (mutationError) => {
      console.error('결제기능 on-off 변경 실패:', mutationError);
      onError?.(mutationError);
    },
  });

  return { mutate, mutateAsync, isPending, error: error || null };
};
