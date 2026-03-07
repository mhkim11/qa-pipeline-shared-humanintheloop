import { useMutation } from '@tanstack/react-query';

import { fetchCreateLaywerRequestMessage } from '@/apis/case-api/request-api';
import type { TCreateLaywerRequestMessageInput, TCreateLaywerRequestMessageOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseCreateLawyerRequestMessageInput = {
  requestId: string;
  input: TCreateLaywerRequestMessageInput;
};

type TUseCreateLawyerRequestMessageOutput = {
  isPending: boolean;
  onCreateLawyerRequestMessage: (data: TUseCreateLawyerRequestMessageInput) => Promise<TCreateLaywerRequestMessageOutput | undefined>;
};

export const useCreateLawyerRequestMessage = (): TUseCreateLawyerRequestMessageOutput => {
  const { mutateAsync, isPending } = useMutation<TCreateLaywerRequestMessageOutput, AxiosError, TUseCreateLawyerRequestMessageInput>({
    mutationFn: ({ requestId, input }) => fetchCreateLaywerRequestMessage(requestId, input),
  });

  const onCreateLawyerRequestMessage = async (
    data: TUseCreateLawyerRequestMessageInput,
  ): Promise<TCreateLaywerRequestMessageOutput | undefined> => {
    try {
      return await mutateAsync(data);
    } catch (e: any) {
      console.error('추가 요청 메시지 생성 실패:', e?.message);
      return undefined;
    }
  };

  return { isPending, onCreateLawyerRequestMessage };
};
