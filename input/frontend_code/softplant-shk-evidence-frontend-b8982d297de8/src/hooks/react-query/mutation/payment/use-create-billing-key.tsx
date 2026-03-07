import { useMutation, UseMutationResult } from '@tanstack/react-query';

import { fetchCreateBillingKey } from '@/apis/payment-api';
import { TCreateBillingKeyOutput } from '@/apis/type/payment.type';

type TUseCreateBillingKeyInput = {
  customerKey: string;
  authKey: string;
};

export const useCreateBillingKey = (): UseMutationResult<TCreateBillingKeyOutput, Error, TUseCreateBillingKeyInput> => {
  return useMutation<TCreateBillingKeyOutput, Error, TUseCreateBillingKeyInput>({
    mutationFn: ({ customerKey, authKey }) => fetchCreateBillingKey(customerKey, authKey),
  });
};
