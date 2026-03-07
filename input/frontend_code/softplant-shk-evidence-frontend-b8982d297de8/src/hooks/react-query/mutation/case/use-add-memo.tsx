import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAddMemo } from '@/apis/case-api/cliping-api';
import type { TAddMemoInput, TAddMemoOutput } from '@/apis/type/case-type/cliping.type';

type TAddMemoRequest = { clipping_id: string; input: TAddMemoInput };

type TUseAddMemoOutput = {
  isPending: boolean;
  onAddMemo: (data: TAddMemoRequest) => Promise<TAddMemoOutput | undefined>;
};

export const useAddMemo = (): TUseAddMemoOutput => {
  const { mutateAsync, isPending } = useMutation<TAddMemoOutput, AxiosError, TAddMemoRequest>({
    mutationFn: fetchAddMemo,
  });

  const onAddMemo = async (input: TAddMemoRequest): Promise<TAddMemoOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('메모 추가 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onAddMemo };
};
