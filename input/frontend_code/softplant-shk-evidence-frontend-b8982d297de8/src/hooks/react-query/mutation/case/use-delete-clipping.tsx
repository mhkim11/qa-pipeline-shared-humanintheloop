import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteClipping } from '@/apis/case-api/cliping-api';
import type { TDeleteClippingInput, TDeleteClippingOutput } from '@/apis/type/case-type/cliping.type';

type TUseDeleteClippingOutput = {
  isPending: boolean;
  onDeleteClipping: (data: TDeleteClippingInput) => Promise<TDeleteClippingOutput | undefined>;
};

export const useDeleteClipping = (): TUseDeleteClippingOutput => {
  const { mutateAsync, isPending } = useMutation<TDeleteClippingOutput, AxiosError, TDeleteClippingInput>({
    mutationFn: fetchDeleteClipping,
  });

  const onDeleteClipping = async (input: TDeleteClippingInput): Promise<TDeleteClippingOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('클리핑 삭제 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onDeleteClipping };
};
