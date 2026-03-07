import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchModifyEvidenceMemo, EVIDENCE_QUERY_KEY } from '@/apis';
import { useModifyEvidenceBookmarkSchema } from '@/apis/schema';
import { TModifyEvidenceMemoInput, TModifyEvidenceMemoOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseModifyEvidenceMemoOutput = {
  isPending: boolean;
  onModifyEvidenceMemo: (data: TModifyEvidenceMemoInput) => Promise<TMutationOutput | undefined>;
};

/**
 * *메모 등록 수정: modify [react-query mutation]
 * @returns {TUseCreateEvidenceMemoOutput} 메모 등록 결과
 */
export const useModifyEvidenceMemo = (): TUseModifyEvidenceMemoOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TModifyEvidenceMemoOutput, AxiosError, TModifyEvidenceMemoInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.MODIFY_EVIDENCE_MEMO,
      status: 'U',
    }),
    mutationFn: fetchModifyEvidenceMemo,
    onSuccess: async (_response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_QUERY_KEY.MODIFY_EVIDENCE_MEMO);
          },
        }),
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_QUERY_KEY.MODIFY_EVIDENCE_MEMO);
          },
        }),
      ]);
    },
  });
  /**
   * * 메모 수정 함수
   * @param {TCreateEvidenceMemoInput} input 메모 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 메모 등록 결과
   */
  const onModifyEvidenceMemo = async (input: TModifyEvidenceMemoInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useModifyEvidenceBookmarkSchema.safeParse(input);

    // 유효성 검사 실패 처리
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사 실패. 입력 데이터를 확인해주세요.',
      };
    }

    try {
      const response = await mutateAsync(parsedInput.data);

      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '메모 수정에 성공했습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '메모 수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };
  return { isPending, onModifyEvidenceMemo };
};
