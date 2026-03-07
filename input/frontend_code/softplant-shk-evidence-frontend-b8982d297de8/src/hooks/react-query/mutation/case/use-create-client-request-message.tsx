import { useMutation } from '@tanstack/react-query';

import { fetchCreateClientRequestMessage } from '@/apis/case-api/request-api';
import type { TRequestCreateClientMessageInput, TRequestCreateClientMessageOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseCreateClientRequestMessageInput = {
  requestId: string;
  input: TRequestCreateClientMessageInput;
};

type TUseCreateClientRequestMessageOutput = {
  isPending: boolean;
  onCreateClientRequestMessage: (data: TUseCreateClientRequestMessageInput) => Promise<TRequestCreateClientMessageOutput | undefined>;
};

export const useCreateClientRequestMessage = (): TUseCreateClientRequestMessageOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestCreateClientMessageOutput, AxiosError, TUseCreateClientRequestMessageInput>({
    mutationFn: ({ requestId, input }) => fetchCreateClientRequestMessage(requestId, input),
  });

  const onCreateClientRequestMessage = async (
    data: TUseCreateClientRequestMessageInput,
  ): Promise<TRequestCreateClientMessageOutput | undefined> => {
    try {
      return await mutateAsync(data);
    } catch (e: any) {
      console.error('의뢰인 메시지 생성 실패:', e?.message);
      return undefined;
    }
  };

  return { isPending, onCreateClientRequestMessage };
};
