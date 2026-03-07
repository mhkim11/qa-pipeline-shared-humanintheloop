import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchDeleteEvidenceMemo, EVIDENCE_QUERY_KEY } from '@/apis';
import { useDeleteEvidenceMemoSchema } from '@/apis/schema';
import { TDeleteEvidenceMemoInput, TDeleteEvidenceMemoOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseDeleteEvidenceMemoOutput = {
  isPending: boolean;
  onDeleteEvidenceMemo: (data: TDeleteEvidenceMemoInput) => Promise<TMutationOutput | undefined>;
};

/**
 * *메모 삭제 : create [react-query mutation]
 * @returns {TUseDeleteEvidenceMemoOutput} 메모 삭제 결과
 */
export const useDeleteEvidenceMemo = (): TUseDeleteEvidenceMemoOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending: isPending } = useMutation<TDeleteEvidenceMemoOutput, AxiosError, TDeleteEvidenceMemoInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.DELETE_EVIDENCE_MEMO,
      status: 'D',
    }),
    mutationFn: fetchDeleteEvidenceMemo,
    onSuccess: async (_response) => {
      // DELETE 성공 후 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: [EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE], // 리스트 캐시 무효화
      });

      // 필요한 경우 다른 쿼리도 무효화
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.DELETE_EVIDENCE_MEMO),
      });
    },
  });

  /**
   * * 메모 삭제 함수
   * @param {TDeleteEvidenceMemoInput} input 메모 삭제 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 메모 삭제 결과
   */
  const onDeleteEvidenceMemo = async (input: TDeleteEvidenceMemoInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useDeleteEvidenceMemoSchema.safeParse(input);

    // 유효성 검사를 통과하지 못한 경우 오류를 처리합니다.
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }

    try {
      // 삭제 요청
      const response = await mutateAsync(parsedInput.data);

      if (!response || !response.success) {
        throw new Error(response?.message || '메모 삭제에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '메모 삭제에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onDeleteEvidenceMemo };
};
