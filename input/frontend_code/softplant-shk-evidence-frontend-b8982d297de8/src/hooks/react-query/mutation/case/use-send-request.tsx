import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchSendRequest } from '@/apis/case-api/request-api';
import type { TRequestSendInput, TRequestSendOutput } from '@/apis/type/case-type/request-type';

type TUseSendRequestOutput = {
  isPending: boolean;
  onSendRequest: (requestId: string, input: TRequestSendInput) => Promise<TRequestSendOutput | undefined>;
};

export const useSendRequest = (): TUseSendRequestOutput => {
  const { mutateAsync, isPending } = useMutation<TRequestSendOutput, AxiosError, { requestId: string; input: TRequestSendInput }>({
    mutationFn: ({ requestId, input }) => fetchSendRequest(requestId, input),
  });

  const onSendRequest = async (requestId: string, input: TRequestSendInput): Promise<TRequestSendOutput | undefined> => {
    try {
      return await mutateAsync({ requestId, input });
    } catch (error: any) {
      console.error('요청 임시저장 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onSendRequest };
};
