import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetClippingNotes } from '@/apis/case-api/cliping-api';
import type { TGetClippingNotesInput, TGetClippingNotesOutput } from '@/apis/type/case-type/cliping.type';

type TGetClippingNotesRequest = { clipping_id: string; input: TGetClippingNotesInput };

type TUseGetClippingNotesOutput = {
  isPending: boolean;
  onGetClippingNotes: (data: TGetClippingNotesRequest) => Promise<TGetClippingNotesOutput | undefined>;
};

export const useGetClippingNotes = (): TUseGetClippingNotesOutput => {
  const { mutateAsync, isPending } = useMutation<TGetClippingNotesOutput, AxiosError, TGetClippingNotesRequest>({
    mutationFn: fetchGetClippingNotes,
  });

  const onGetClippingNotes = async (input: TGetClippingNotesRequest): Promise<TGetClippingNotesOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('클리핑 메모 조회 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onGetClippingNotes };
};
