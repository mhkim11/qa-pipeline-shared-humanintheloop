import { useMutation } from '@tanstack/react-query';

import { fetchCreatePayment } from '@/apis/payment-api';
import { TCreatePaymentInput, TCreatePaymentOutput } from '@/apis/type/payment.type';

export const useCreatePayment = () => {
  return useMutation<TCreatePaymentOutput, Error, TCreatePaymentInput>({
    mutationFn: (input) => fetchCreatePayment(input),
    onSuccess: (data) => {
      console.log('결제 및 구독 생성 성공:', data);
    },
    onError: (error) => {
      console.error('결제 및 구독 생성 실패:', error);
    },
  });
};
