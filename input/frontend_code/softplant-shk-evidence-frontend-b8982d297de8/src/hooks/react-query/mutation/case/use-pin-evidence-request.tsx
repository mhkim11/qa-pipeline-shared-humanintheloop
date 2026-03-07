import { useMutation, useQueryClient } from '@tanstack/react-query';

import { fetchToggleRequestPin } from '@/apis/case-api/request-api';
import type { TRequestPinToggleInput, TRequestPinToggleOutput } from '@/apis/type/case-type/request-type';

type TUsePinEvidenceRequest = {
  mutateAsync: (input: TRequestPinToggleInput) => Promise<TRequestPinToggleOutput>;
  isPending: boolean;
};

export const usePinEvidenceRequest = (): TUsePinEvidenceRequest => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation<TRequestPinToggleOutput, unknown, TRequestPinToggleInput>({
    mutationFn: fetchToggleRequestPin,
    onSuccess: async () => {
      // keep request list in sync (single refetch)
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'evidence-request' && q.queryKey[1] === 'list',
      });
    },
  });

  return { mutateAsync, isPending };
};
