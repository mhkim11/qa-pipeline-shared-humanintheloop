import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateEvidenceTagOrder, EVIDENCE_QUERY_KEY } from '@/apis';
import { TUpdateEvidenceTagOrderInput, TUpdateEvidenceTagOrderOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseUpdateEvidenceTagOrderOutput = {
  isPending: boolean;
  onUpdateEvidenceTagOrder: (data: TUpdateEvidenceTagOrderInput) => Promise<TUpdateEvidenceTagOrderOutput>;
};

/**
 * * 태그 순서 변경 : reorder [react-query mutation]
 * @returns {TUseUpdateEvidenceTagOrderOutput} 태그 순서 변경 결과
 */
export const useUpdateEvidenceTagOrder = (): TUseUpdateEvidenceTagOrderOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TUpdateEvidenceTagOrderOutput, AxiosError, TUpdateEvidenceTagOrderInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.LIST_EVIDENCE_TAGS_ORDER,
      status: 'I',
    }),
    mutationFn: fetchUpdateEvidenceTagOrder,
    onSuccess: async (data) => {
      if (data?.success) {
        await queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_QUERY_KEY.LIST_EVIDENCE_TAGS);
          },
        });
      }
    },
  });

  /**
   * * 태그 순서 변경 함수
   * @param {TUpdateEvidenceTagOrderInput} input 태그 순서 변경 입력 데이터
   * @returns {Promise<TUpdateEvidenceTagOrderOutput>} 태그 순서 변경 결과
   */
  const onUpdateEvidenceTagOrder = async (input: TUpdateEvidenceTagOrderInput): Promise<TUpdateEvidenceTagOrderOutput> => {
    try {
      const response = await mutateAsync(input);

      if (response?.success) {
        return {
          success: true,
          message: response.message || '태그 순서가 변경되었습니다.',
        };
      }

      return {
        success: false,
        message: response.message || '태그 순서 변경에 실패했습니다.',
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      return {
        success: false,
        message: axiosError.message || '알 수 없는 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onUpdateEvidenceTagOrder };
};
