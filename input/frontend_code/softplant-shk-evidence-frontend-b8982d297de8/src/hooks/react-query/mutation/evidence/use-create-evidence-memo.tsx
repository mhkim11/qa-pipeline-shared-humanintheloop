import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchCreateEvidenceMemo, EVIDENCE_QUERY_KEY } from '@/apis';
import { useCreateEvidenceMemoSchema } from '@/apis/schema';
import { TCreateEvidenceMemoInput, TCreateEvidenceMemoOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseCreateEvidenceMemoOutput = {
  isPending: boolean;
  onCreateEvidenceMemo: (data: TCreateEvidenceMemoInput) => Promise<TMutationOutput | undefined>;
};

/**
 * *메모 등록 : create [react-query mutation]
 * @returns {TUseCreateEvidenceMemoOutput} 메모 등록 결과
 */
export const useCreateEvidenceMemo = (): TUseCreateEvidenceMemoOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TCreateEvidenceMemoOutput, AxiosError, TCreateEvidenceMemoInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_MEMO,
      status: 'I',
    }),
    mutationFn: fetchCreateEvidenceMemo,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.CREATE_EVIDENCE_MEMO);
        },
      });
    },
  });

  /**
   * * 메모 등록 함수
   * @param {TCreateEvidenceMemoInput} input 메모 등록 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 메모 등록 결과
   */
  const onCreateEvidenceMemo = async (input: TCreateEvidenceMemoInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useCreateEvidenceMemoSchema.safeParse(input);

    // 유효성 검사를 통과하지 못한 경우 오류를 처리합니다.
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }

    // 제품 등록 요청 함수
    try {
      const parsedData = { ...parsedInput.data, project_id: parsedInput.data.project_id, evidenceId: parsedInput.data.evidence_id };

      const response = await mutateAsync(parsedData);

      if (!response || !response.success) {
        throw new Error(response?.message || '메모 등록에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '매모 등록에 성공했습니다.' };
    } catch (error: any) {
      return { isSuccess: false, message: error.message };
    }
  };
  return { isPending, onCreateEvidenceMemo };
};
