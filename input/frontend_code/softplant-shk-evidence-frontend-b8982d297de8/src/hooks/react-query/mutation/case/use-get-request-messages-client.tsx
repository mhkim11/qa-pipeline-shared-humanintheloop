import { useCallback } from 'react';

import { useMutation } from '@tanstack/react-query';

import { fetchGetRequestMessagesClient } from '@/apis/case-api/request-api';
import type { TRequestMessageListOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestMessagesClientInput = {
  requestId: string;
  page?: number;
  limit?: number;
};

type TUseGetRequestMessagesClientOutput = {
  isPending: boolean;
  onGetRequestMessagesClient: (input: TUseGetRequestMessagesClientInput) => Promise<TRequestMessageListOutput | undefined>;
};

export const useGetRequestMessagesClient = (): TUseGetRequestMessagesClientOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestMessageListOutput, AxiosError, TUseGetRequestMessagesClientInput>({
    mutationFn: ({ requestId, page = 1, limit = 50 }) => fetchGetRequestMessagesClient(requestId, page, limit),
  });

  const onGetRequestMessagesClient = useCallback(
    async (input: TUseGetRequestMessagesClientInput): Promise<TRequestMessageListOutput | undefined> => {
      try {
        return await mutateAsync(input);
      } catch (e: any) {
        console.error('의뢰인용 요청 메세지 조회 실패:', e?.message);
        return undefined;
      }
    },
    [mutateAsync],
  );

  return { isPending, onGetRequestMessagesClient };
};
