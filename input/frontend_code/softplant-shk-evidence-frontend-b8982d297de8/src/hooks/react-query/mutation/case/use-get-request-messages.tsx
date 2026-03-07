import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import { fetchGetRequestMessages } from '@/apis/case-api/request-api';
import type { TRequestMessageListOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestMessagesInput = {
  requestId: string;
  page?: number;
  limit?: number;
};

type TUseGetRequestMessagesOutput = {
  isPending: boolean;
  onGetRequestMessages: (input: TUseGetRequestMessagesInput) => Promise<TRequestMessageListOutput | undefined>;
};

export const useGetRequestMessages = (): TUseGetRequestMessagesOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestMessageListOutput, AxiosError, TUseGetRequestMessagesInput>({
    mutationFn: ({ requestId, page = 1, limit = 50 }) => fetchGetRequestMessages(requestId, page, limit),
  });

  const onGetRequestMessages = useCallback(
    async (input: TUseGetRequestMessagesInput): Promise<TRequestMessageListOutput | undefined> => {
      try {
        return await mutateAsync(input);
      } catch (e: any) {
        console.error('요청 메세지 조회 실패:', e?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onGetRequestMessages };
};
