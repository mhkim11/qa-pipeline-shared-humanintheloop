import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchRejectProjectInvitation, EVIDENCE_QUERY_KEY } from '@/apis';
import { TRejectProjectInvitationInput, TRejectProjectInvitationOutput, TOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseRejectProjectInvitationOutput = {
  isPending: boolean;
  onRejectProjectInvitation: (data: TRejectProjectInvitationInput) => Promise<TOutput | undefined>;
};

export const useRejectProjectInvitation = (): TUseRejectProjectInvitationOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRejectProjectInvitationOutput, AxiosError, TRejectProjectInvitationInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.REJECT_PROJECT_INVITATION,
      status: 'I',
    }),
    mutationFn: fetchRejectProjectInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.REJECT_PROJECT_INVITATION);
        },
      });
    },
  });

  const onRejectProjectInvitation = async (data: TRejectProjectInvitationInput): Promise<TOutput | undefined> => {
    try {
      const response = await mutateAsync(data);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { isPending, onRejectProjectInvitation };
};
