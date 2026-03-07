import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchRequestJoinProject, EVIDENCE_QUERY_KEY } from '@/apis';
import { TJoinProjectRequestInput, TJoinProjectRequestOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseJoinProjectRequestOutput = {
  isPending: boolean;
  onRequestJoinProject: (data: TJoinProjectRequestInput) => Promise<TOutput | undefined>;
};

export const useJoinProjectRequest = (): TUseJoinProjectRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isPending } = useMutation<TJoinProjectRequestOutput, AxiosError, TJoinProjectRequestInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.REQUEST_JOIN_PROJECT,
      status: 'I',
    }),
    mutationFn: fetchRequestJoinProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.REQUEST_JOIN_PROJECT);
        },
      });
    },
  });

  const onRequestJoinProject = async (data: TJoinProjectRequestInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onRequestJoinProject };
};
