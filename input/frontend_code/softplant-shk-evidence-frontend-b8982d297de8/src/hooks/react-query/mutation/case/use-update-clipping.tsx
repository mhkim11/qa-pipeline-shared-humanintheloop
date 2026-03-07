import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateClipping } from '@/apis/case-api/cliping-api';
import type { TUpdateClippingRequest, TUpdateClippingOutput } from '@/apis/type/case-type/cliping.type';

type TUseUpdateClippingOutput = {
  isPending: boolean;
  onUpdateClipping: (data: TUpdateClippingRequest) => Promise<TUpdateClippingOutput | undefined>;
};

export const useUpdateClipping = (): TUseUpdateClippingOutput => {
  const { mutateAsync, isPending } = useMutation<TUpdateClippingOutput, AxiosError, TUpdateClippingRequest>({
    mutationFn: fetchUpdateClipping,
  });

  const onUpdateClipping = async (input: TUpdateClippingRequest): Promise<TUpdateClippingOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('클리핑 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateClipping };
};
