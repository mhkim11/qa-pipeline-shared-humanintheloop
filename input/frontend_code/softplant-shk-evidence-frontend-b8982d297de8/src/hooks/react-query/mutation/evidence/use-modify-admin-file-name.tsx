import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchModifyOriginalFileName, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TEvidenceOriginalFileNameInput, TEvidenceOriginalFileNameOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseModifyOriginalFileNameOutput = {
  isPending: boolean;
  onModifyOriginalFileName: (data: TEvidenceOriginalFileNameInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 사용자 업로드 파일명 수정: modify [react-query mutation]
 * @returns {TUseModifyOriginalFileNameOutput} 파일명 수정 결과
 */
export const useModifyOriginalFileName = (): TUseModifyOriginalFileNameOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending } = useMutation<TEvidenceOriginalFileNameOutput, AxiosError, TEvidenceOriginalFileNameInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.MODIFY_ORIGINAL_FILE_NAME,
      status: 'U',
    }),
    mutationFn: fetchModifyOriginalFileName,
    onSuccess: async (_response) => {
      // 성공 시 쿼리 무효화 처리
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => {
            return query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.MODIFY_ORIGINAL_FILE_NAME);
          },
        }),
      ]);
    },
  });

  /**
   * * 사용자 업로드 파일명 수정 함수
   * @param {TModifyEvidenceFileNameInput} input 파일명 수정 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 파일명 수정 결과
   */
  const onModifyOriginalFileName = async (input: TEvidenceOriginalFileNameInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      console.log(response);

      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '파일명 수정에 성공했습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '파일명 수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onModifyOriginalFileName };
};
