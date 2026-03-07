import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateProjectFilter } from '@/apis'; // 작성한 API import
import { TListProjectFilterInput, TListProjectFilterOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateProjectFilterOutput = {
  isPending: boolean;
  onCreateProjectFilter: (data: TListProjectFilterInput) => Promise<TListProjectFilterOutput | undefined>;
};

export const useCreateProjectFilter = (): TUseCreateProjectFilterOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending: isPending } = useMutation<TListProjectFilterOutput, AxiosError, TListProjectFilterInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: 'CREATE_PROJECT_FILTER',
      status: 'I',
    }),
    mutationFn: fetchCreateProjectFilter,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes('PROJECT_FILTER'), // 관련된 Query Key 무효화
      });
    },
  });

  const onCreateProjectFilter = async (data: TListProjectFilterInput): Promise<TListProjectFilterOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onCreateProjectFilter };
};
