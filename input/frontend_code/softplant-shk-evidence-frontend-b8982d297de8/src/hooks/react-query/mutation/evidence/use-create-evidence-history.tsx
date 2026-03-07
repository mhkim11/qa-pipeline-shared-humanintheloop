import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAddHistory, EVIDENCE_QUERY_KEY } from '@/apis';
import { TAddHistoryInput, TAddHistoryOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseAddHistoryOutput = {
  isPending: boolean;
  onAddHistory: (data: TAddHistoryInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 히스토리 추가 : create [react-query mutation]
 * @returns {TUseAddHistoryOutput} 히스토리 추가 결과
 */
export const useAddHistory = (): TUseAddHistoryOutput => {
  // useQueryClient 사용
  const queryClient = useQueryClient();

  // useMutation 설정
  const { mutateAsync, isPending } = useMutation<TAddHistoryOutput, AxiosError, TAddHistoryInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_HISTORY,
      status: 'I',
    }),
    mutationFn: fetchAddHistory,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_HISTORY);
        },
      });
    },
  });

  /**
   * * 히스토리 추가 함수
   * @param {TAddHistoryInput} input 히스토리 추가 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 히스토리 추가 결과
   */
  const onAddHistory = async (input: TAddHistoryInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      if (!response || !response.success) {
        throw new Error(response?.message || '히스토리 추가에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '히스토리 추가에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message };
    }
  };

  return { isPending, onAddHistory };
};
