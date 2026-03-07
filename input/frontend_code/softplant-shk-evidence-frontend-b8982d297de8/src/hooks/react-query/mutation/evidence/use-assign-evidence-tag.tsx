import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListAssignEvidenceTag, EVIDENCE_QUERY_KEY } from '@/apis';
import { TAssignEvidenceTagInput, TAssignEvidenceTagOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseAssignEvidenceTagOutput = {
  isPending: boolean;
  onAssignEvidenceTag: (data: TAssignEvidenceTagInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 증거목록에 태그 할당 : create [react-query mutation]
 * @returns {TUseAssignEvidenceTagOutput} 태그 할당 결과
 */
export const useAssignEvidenceTag = (): TUseAssignEvidenceTagOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TAssignEvidenceTagOutput, AxiosError, TAssignEvidenceTagInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.LIST_ASSIGN_EVIDENCE_TAG,
      status: 'I',
    }),
    mutationFn: fetchListAssignEvidenceTag,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.LIST_ASSIGN_EVIDENCE_TAG);
        },
      });
    },
  });

  /**
   * * 증거목록에 태그 할당 함수
   * @param {TAssignEvidenceTagInput} input 태그 할당 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 태그 할당 결과
   */
  const onAssignEvidenceTag = async (input: TAssignEvidenceTagInput): Promise<TMutationOutput | undefined> => {
    try {
      console.log('태그 할당 요청:', input);
      const response = await mutateAsync(input);
      console.log('태그 할당 응답:', response);

      // 성공 응답 처리
      if (response && response.success) {
        console.log('태그 할당 성공');
        return { isSuccess: true, message: response?.message || '태그 할당에 성공했습니다.' };
      }

      // 실패 응답 처리
      if (!response || !response.success) {
        // 응답에서 에러 메시지 추출
        const errorMessage = response?.message || '';
        const errorData = (response as any)?.error;

        // 중복 키 오류 확인 (여러 경로에서 확인)
        let isDuplicateError = false;

        if (errorMessage) {
          isDuplicateError = errorMessage.includes('duplicate') || errorMessage.includes('E11000');
        }

        if (errorData) {
          const errorResponse = errorData?.errorResponse || errorData;
          const errmsg = errorResponse?.errmsg || '';
          if (errmsg.includes('duplicate') || errmsg.includes('E11000')) {
            isDuplicateError = true;
          }
        }

        if (isDuplicateError) {
          // 중복 키 오류는 이미 할당된 것으로 간주하고 성공으로 처리
          return { isSuccess: true, message: '태그가 이미 할당되어 있습니다.' };
        }

        return { isSuccess: false, message: errorMessage || '태그 할당에 실패했습니다.' };
      }

      return { isSuccess: true, message: response?.message || '태그 할당에 성공했습니다.' };
    } catch (error: any) {
      console.error('태그 할당 에러:', error);
      console.error('태그 할당 에러 응답:', error?.response);
      console.error('태그 할당 에러 데이터:', error?.response?.data);

      // Axios 에러에서 중복 키 오류 확인
      const errorResponse = error?.response?.data;
      let errorMessage = '';
      let isDuplicateError = false;

      // 에러 메시지 추출 (여러 경로에서 확인)
      if (errorResponse) {
        // 1차: errorResponse.message 확인
        errorMessage = errorResponse?.message || '';

        // 2차: errorResponse.error.errorResponse.errmsg 확인 (실제 에러 구조)
        const errorData = errorResponse?.error;
        if (errorData) {
          const errorResp = errorData?.errorResponse || errorData;
          const errmsg = errorResp?.errmsg || errorResp?.message || '';
          if (errmsg) {
            errorMessage = errmsg;
          }

          // code로도 중복 키 오류 확인
          if (errorResp?.code === 11000 || errorData?.code === 11000) {
            isDuplicateError = true;
          }
        }

        // 3차: errorResponse.error.code 확인
        if (errorData?.code === 11000) {
          isDuplicateError = true;
        }
      }

      if (!errorMessage) {
        errorMessage = error?.message || '';
      }

      // 중복 키 오류 확인 (메시지와 코드 모두 확인)
      if (!isDuplicateError) {
        isDuplicateError = errorMessage.includes('duplicate') || errorMessage.includes('E11000');
      }

      console.log('중복 키 오류 여부:', isDuplicateError, '에러 메시지:', errorMessage);

      if (isDuplicateError) {
        // 중복 키 오류는 이미 할당된 것으로 간주하고 성공으로 처리
        console.log('중복 키 오류로 인해 성공으로 처리');
        return { isSuccess: true, message: '태그가 이미 할당되어 있습니다.' };
      }

      return { isSuccess: false, message: errorMessage || '알 수 없는 오류가 발생했습니다.' };
    }
  };

  return { isPending, onAssignEvidenceTag };
};
