import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchExcludeProject, EVIDENCE_QUERY_KEY } from '@/apis';
import { TExcludeProjectInput, TExcludeProjectOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseExcludeProjectOutput = {
  isPending: boolean;
  onExcludeProject: (data: TExcludeProjectInput) => Promise<TOutput | undefined>;
};

export const useExcludeProject = (): TUseExcludeProjectOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TExcludeProjectOutput, AxiosError, TExcludeProjectInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.EXCLUDE_PROJECT,
      status: 'I',
    }),
    mutationFn: fetchExcludeProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.EXCLUDE_PROJECT);
        },
      });
    },
  });

  const onExcludeProject = async (data: TExcludeProjectInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onExcludeProject };
};
