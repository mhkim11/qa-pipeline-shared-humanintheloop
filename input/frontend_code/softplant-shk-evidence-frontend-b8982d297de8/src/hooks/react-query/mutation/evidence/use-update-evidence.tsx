import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_QUERY_KEY, fetchUpdateEvidence } from '@/apis';
import type { TMutationOutput, TUpdateEvidenceInput, TUpdateEvidenceOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseUpdateEvidenceOutput = {
  isPending: boolean;
  onUpdateEvidence: (data: TUpdateEvidenceInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 증거인부 수정 : update [react-query mutation]
 */
export const useUpdateEvidence = (): TUseUpdateEvidenceOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TUpdateEvidenceOutput, AxiosError, TUpdateEvidenceInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.UPDATE_EVIDENCE,
      status: 'U',
    }),
    mutationFn: fetchUpdateEvidence,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.LIST_EVIDENCE_OPINION),
      });
    },
  });

  const onUpdateEvidence = async (input: TUpdateEvidenceInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);
      if (!response || !response.success) throw new Error(response?.message || '증거인부 수정에 실패했습니다.');
      return { isSuccess: true, message: response?.message || '증거인부 수정에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error?.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onUpdateEvidence };
};
