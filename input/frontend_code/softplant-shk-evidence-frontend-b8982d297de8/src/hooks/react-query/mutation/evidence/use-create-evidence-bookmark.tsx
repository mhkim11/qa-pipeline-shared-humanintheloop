import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateEvidenceBookmark, EVIDENCE_QUERY_KEY } from '@/apis';
import { useCreateEvidenceBookmarkSchema } from '@/apis/schema';
import { TCreateEvidenceBookMarkInput, TCreateEvidenceBookMarkOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateEvidenceBookmartOutput = {
  isPending: boolean;
  onCreateEvidenceBookmark: (data: TCreateEvidenceBookMarkInput) => Promise<TMutationOutput | undefined>;
};

/**
 * *북마크 등록 : create [react-query mutation]
 * @returns {TUseCreateEvidenceMemoOutput} 북마크 등록 결과
 */
export const useCreateEvidenceBookmark = (): TUseCreateEvidenceBookmartOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TCreateEvidenceBookMarkOutput, AxiosError, TCreateEvidenceBookMarkInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_BOOKMARK,
      status: 'I',
    }),
    mutationFn: fetchCreateEvidenceBookmark,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_BOOKMARK);
        },
      });
    },
  });

  /**
   * * 북마크 등록 함수
   * @param {TCreateEvidenceMemoInput} input 북마크 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 북마크 등록 결과
   */
  const onCreateEvidenceBookmark = async (input: TCreateEvidenceBookMarkInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useCreateEvidenceBookmarkSchema.safeParse(input);

    // 유효성 검사를 통과하지 못한 경우 오류를 처리합니다.
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }

    // 제품 등록 요청 함수
    try {
      const parsedData = { ...parsedInput.data, project_id: parsedInput.data.project_id, evidence_id: parsedInput.data.evidence_id };

      const response = await mutateAsync(parsedData);

      if (!response || !response.success) {
        throw new Error(response?.message || '북마크 등록에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '북마크 등록에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message };
    }
  };
  return { isPending, onCreateEvidenceBookmark };
};
