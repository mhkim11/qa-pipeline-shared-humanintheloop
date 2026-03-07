import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateEvidenceTag, EVIDENCE_QUERY_KEY } from '@/apis';
import { TCreateEvidenceTagInput, TCreateEvidenceTagOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateEvidenceTagOutput = {
  isPending: boolean;
  onCreateEvidenceTag: (data: TCreateEvidenceTagInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 태그 생성 : create [react-query mutation]
 * @returns {TUseCreateEvidenceTagOutput} 태그 생성 결과
 */
export const useCreateEvidenceTag = (): TUseCreateEvidenceTagOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TCreateEvidenceTagOutput, AxiosError, TCreateEvidenceTagInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_TAG,
      status: 'I',
    }),
    mutationFn: fetchCreateEvidenceTag,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_TAG);
        },
      });
    },
  });

  /**
   * * 태그 생성 함수
   * @param {TCreateEvidenceTagInput} input 태그 생성 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 태그 생성 결과
   */
  const onCreateEvidenceTag = async (input: TCreateEvidenceTagInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      if (!response || !response.success) {
        throw new Error(response?.message || '태그 생성에 실패했습니다.');
      }

      return { isSuccess: true, message: '태그가 생성되었습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onCreateEvidenceTag };
};
