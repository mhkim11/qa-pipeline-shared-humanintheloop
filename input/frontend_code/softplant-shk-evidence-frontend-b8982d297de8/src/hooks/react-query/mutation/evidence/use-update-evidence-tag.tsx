import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateEvidenceTag, EVIDENCE_QUERY_KEY } from '@/apis';
import { TUpdateEvidenceTagInput, TUpdateEvidenceTagOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseUpdateEvidenceTagOutput = {
  isPending: boolean;
  onUpdateEvidenceTag: (data: TUpdateEvidenceTagInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 태그 수정 : update [react-query mutation]
 * @returns {TUseUpdateEvidenceTagOutput} 태그 수정 결과
 */
export const useUpdateEvidenceTag = (): TUseUpdateEvidenceTagOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TUpdateEvidenceTagOutput, AxiosError, TUpdateEvidenceTagInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.UPDATE_EVIDENCE_TAG,
      status: 'U',
    }),
    mutationFn: fetchUpdateEvidenceTag,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.UPDATE_EVIDENCE_TAG);
        },
      });
    },
  });

  /**
   * * 태그 수정 함수
   * @param {TUpdateEvidenceTagInput} input 태그 수정 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 태그 수정 결과
   */
  const onUpdateEvidenceTag = async (input: TUpdateEvidenceTagInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      if (!response || !response.success) {
        throw new Error(response?.message || '태그 수정에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '태그 수정에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onUpdateEvidenceTag };
};
