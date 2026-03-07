import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDelegateSuperPermission, EVIDENCE_QUERY_KEY } from '@/apis';
import { TDelegateSuperPermissionInput, TDelegateSuperPermissionOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseDelegateSuperPermissionOutput = {
  isPending: boolean;
  onDelegateSuperPermission: (data: TDelegateSuperPermissionInput) => Promise<TOutput | undefined>;
};

export const useDelegateSuperPermission = (): TUseDelegateSuperPermissionOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TDelegateSuperPermissionOutput, AxiosError, TDelegateSuperPermissionInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.DELEGATE_SUPER_PERMISSION,
      status: 'I',
    }),
    mutationFn: fetchDelegateSuperPermission,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.DELEGATE_SUPER_PERMISSION);
        },
      });
    },
  });

  const onDelegateSuperPermission = async (data: TDelegateSuperPermissionInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onDelegateSuperPermission };
};
