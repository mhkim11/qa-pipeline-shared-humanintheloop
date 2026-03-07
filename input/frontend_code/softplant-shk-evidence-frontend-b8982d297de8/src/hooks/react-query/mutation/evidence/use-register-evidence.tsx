import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_QUERY_KEY, fetchRegisterEvidence } from '@/apis';
import type { TMutationOutput, TRegisterEvidenceInput, TRegisterEvidenceOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseRegisterEvidenceOutput = {
  isPending: boolean;
  onRegisterEvidence: (data: TRegisterEvidenceInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 증거인부 등록 : create [react-query mutation]
 */
export const useRegisterEvidence = (): TUseRegisterEvidenceOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TRegisterEvidenceOutput, AxiosError, TRegisterEvidenceInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.REGISTER_EVIDENCE,
      status: 'I',
    }),
    mutationFn: fetchRegisterEvidence,
    onSuccess: async () => {
      // 목록/카운트 등 후속 조회가 있는 경우 갱신
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.LIST_EVIDENCE_OPINION),
      });
    },
  });

  const onRegisterEvidence = async (input: TRegisterEvidenceInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);
      if (!response || !response.success) throw new Error(response?.message || '증거인부 등록에 실패했습니다.');
      return { isSuccess: true, message: response?.message || '증거인부 등록에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error?.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onRegisterEvidence };
};
