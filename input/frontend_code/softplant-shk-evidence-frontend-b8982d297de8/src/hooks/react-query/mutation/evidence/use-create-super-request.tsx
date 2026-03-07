import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchRequestSuperPermission, EVIDENCE_QUERY_KEY } from '@/apis';
import { TRequestSuperPermissionInput, TRequestSuperPermissionOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseSuperPermissionRequestOutput = {
  isPending: boolean;
  onRequestSuperPermission: (data: TRequestSuperPermissionInput) => Promise<TOutput | undefined>;
};

export const useSuperPermissionRequest = (): TUseSuperPermissionRequestOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRequestSuperPermissionOutput, AxiosError, TRequestSuperPermissionInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.REQUEST_SUPER_PERMISSION,
      status: 'I',
    }),
    mutationFn: fetchRequestSuperPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.REQUEST_SUPER_PERMISSION);
        },
      });
    },
  });

  const onRequestSuperPermission = async (data: TRequestSuperPermissionInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onRequestSuperPermission };
};
