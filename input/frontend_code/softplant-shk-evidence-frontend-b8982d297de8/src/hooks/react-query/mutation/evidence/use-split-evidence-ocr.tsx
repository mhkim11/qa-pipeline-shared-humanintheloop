import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchSplitAndOcrRequest } from '@/apis';
import type { TSplitAndOcrRequestInput, TSplitAndOcrRequestOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker, to } from '@/components/utils';

type TUseSplitAndOcrOutput = {
  isPending: boolean;
  onSplitAndOcrRequest: (input: TSplitAndOcrRequestInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 분할 및 OCR 요청 훅 : [react-query mutation]
 * @returns {TUseSplitAndOcrOutput} 분할 및 OCR 요청 결과
 */
export const useSplitAndOcrRequest = (): TUseSplitAndOcrOutput => {
  const queryClient = useQueryClient();

  const { isPending, mutateAsync } = useMutation<TSplitAndOcrRequestOutput, AxiosError, TSplitAndOcrRequestInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.SPLIT_AND_OCR_REQUEST,
      status: 'U',
    }),
    mutationFn: fetchSplitAndOcrRequest,
    onSuccess: async (_response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.FIND_SPLIT_OCR_EVIDENCE),
        }),
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.SPLIT_AND_OCR_REQUEST),
        }),
      ]);
    },
  });
  /**
   * * 분할 및 OCR 요청 함수
   * @param {TSplitAndOcrRequestInput} input - 분할 및 OCR 요청 데이터
   * @return {Promise<TMutationOutput | undefined>} - 요청 결과
   */
  const onSplitAndOcrRequest = async (input: TSplitAndOcrRequestInput): Promise<TMutationOutput | undefined> => {
    const [resultError, result] = await to(mutateAsync(input));

    if (resultError instanceof AxiosError) {
      const errorData = resultError.response?.data;
      let errorMessage = errorData?.message || '분할 및 OCR 요청에 실패했습니다.';

      // error 필드가 있으면 추가
      if (errorData?.error) {
        errorMessage = errorData.error;
      }

      return { isSuccess: false, message: errorMessage };
    }

    // 성공적으로 응답했지만 success가 false인 경우
    if (result && !result.success) {
      let errorMessage = result.message || '분할 및 OCR 요청에 실패했습니다.';

      // error 필드가 있으면 사용
      if (result.error) {
        errorMessage = typeof result.error === 'string' ? result.error : result.error.message || result.error.toString();
      }

      return { isSuccess: false, message: errorMessage };
    }

    return { isSuccess: result?.success ?? false, message: result?.message || '분할 및 OCR 요청에 성공했습니다.', data: result?.data };
  };

  return { isPending, onSplitAndOcrRequest };
};
