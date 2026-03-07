import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateClipping } from '@/apis/case-api/cliping-api';
import type { TCreateClippingOutput, TCreateClippingRequest } from '@/apis/type/case-type/cliping.type';

type TUseCreateClippingOutput = {
  isPending: boolean;
  onCreateClipping: (data: TCreateClippingRequest) => Promise<TCreateClippingOutput | undefined>;
};

export const useCreateClipping = (): TUseCreateClippingOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCreateClippingOutput, AxiosError, TCreateClippingRequest>({
    mutationFn: fetchCreateClipping,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.includes('clipping-list'),
      });
    },
  });

  const onCreateClipping = async (input: TCreateClippingRequest): Promise<TCreateClippingOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('클리핑 생성 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onCreateClipping };
};
