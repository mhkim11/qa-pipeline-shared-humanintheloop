import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchUpdateRequest } from '@/apis/case-api/request-api';
import type { TRequestUpdateInput, TRequestUpdateOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseUpdateRequestInput = {
  requestId: string;
  input: TRequestUpdateInput;
};

type TUseUpdateRequestOutput = {
  isPending: boolean;
  onUpdateRequest: (data: TUseUpdateRequestInput) => Promise<TRequestUpdateOutput | undefined>;
};

export const useUpdateRequest = (): TUseUpdateRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRequestUpdateOutput, AxiosError, TUseUpdateRequestInput>({
    mutationFn: ({ requestId, input }) => fetchUpdateRequest(requestId, input),
    onSuccess: async () => {
      // refresh any evidence-request list queries regardless of filters/sort
      await queryClient.refetchQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
      });
    },
  });

  const onUpdateRequest = async (data: TUseUpdateRequestInput): Promise<TRequestUpdateOutput | undefined> => {
    try {
      return await mutateAsync(data);
    } catch (error: any) {
      console.error('자료 요청 수정 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onUpdateRequest };
};
