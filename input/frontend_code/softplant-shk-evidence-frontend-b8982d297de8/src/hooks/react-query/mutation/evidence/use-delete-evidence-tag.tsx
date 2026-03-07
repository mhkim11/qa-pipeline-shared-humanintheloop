import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteEvidenceTagSet, EVIDENCE_QUERY_KEY } from '@/apis';
import { TDeleteEvidenceTagSetInput, TDeleteEvidenceTagSetOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseDeleteEvidenceTagOutput = {
  isPending: boolean;
  onDeleteEvidenceTag: (data: TDeleteEvidenceTagSetInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 태그 삭제 : delete [react-query mutation]
 * @returns {TUseDeleteEvidenceTagOutput} 태그 삭제 결과
 */
export const useDeleteEvidenceTag = (): TUseDeleteEvidenceTagOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TDeleteEvidenceTagSetOutput, AxiosError, TDeleteEvidenceTagSetInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.DELETE_EVIDENCE_TAG,
      status: 'D',
    }),
    mutationFn: fetchDeleteEvidenceTagSet,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.DELETE_EVIDENCE_TAG);
        },
      });
    },
  });

  /**
   * * 태그 삭제 함수
   * @param {TDeleteEvidenceTagInput} input 태그 삭제 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 태그 삭제 결과
   */
  const onDeleteEvidenceTag = async (input: TDeleteEvidenceTagSetInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      if (!response || !response.success) {
        throw new Error(response?.message || '태그 삭제에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '태그 삭제에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onDeleteEvidenceTag };
};
