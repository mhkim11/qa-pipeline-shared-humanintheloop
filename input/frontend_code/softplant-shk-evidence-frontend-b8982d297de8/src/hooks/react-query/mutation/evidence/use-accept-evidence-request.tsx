import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchProcessJoinRequest, EVIDENCE_QUERY_KEY } from '@/apis';
import { TProcessJoinRequestInput, TProcessJoinRequestOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseProcessJoinRequestOutput = {
  isPending: boolean;
  onProcessJoinRequest: (data: TProcessJoinRequestInput) => Promise<TOutput | undefined>;
};

export const useProcessJoinRequest = (): TUseProcessJoinRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TProcessJoinRequestOutput, AxiosError, TProcessJoinRequestInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.REQUEST_JOIN_PROJECT,
      status: 'I',
    }),
    mutationFn: fetchProcessJoinRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.REQUEST_JOIN_PROJECT);
        },
      });
    },
  });

  const onProcessJoinRequest = async (data: TProcessJoinRequestInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onProcessJoinRequest };
};
