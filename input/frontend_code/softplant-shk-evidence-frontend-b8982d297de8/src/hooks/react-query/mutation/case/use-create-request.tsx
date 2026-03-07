import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchCreateRequest } from '@/apis/case-api/request-api';
import type { TRequestCreateInput, TRequestCreateOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseCreateRequestOutput = {
  isPending: boolean;
  onCreateRequest: (data: TRequestCreateInput) => Promise<TRequestCreateOutput | undefined>;
};

export const useCreateRequest = (): TUseCreateRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRequestCreateOutput, AxiosError, TRequestCreateInput>({
    mutationFn: fetchCreateRequest,
    onSuccess: async (_data, variables) => {
      await queryClient.refetchQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0] === 'evidence-request' &&
          q.queryKey[1] === 'list' &&
          q.queryKey[2] === variables.civil_case_id,
      });
    },
  });

  const onCreateRequest = async (input: TRequestCreateInput): Promise<TRequestCreateOutput | undefined> => {
    try {
      return await mutateAsync(input);
    } catch (error: any) {
      console.error('자료 요청 생성 실패:', error?.message);
      return undefined;
    }
  };

  return { isPending, onCreateRequest };
};
