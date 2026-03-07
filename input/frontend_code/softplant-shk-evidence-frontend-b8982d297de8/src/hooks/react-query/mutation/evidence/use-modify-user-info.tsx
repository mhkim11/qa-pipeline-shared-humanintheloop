import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchUpdateUserInfo, EVIDENCE_QUERY_KEY } from '@/apis';
import { TUpdateUserInfoInput, TUpdateUserInfoOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseUpdateUserInfoOutput = {
  isPending: boolean;
  onUpdateUserInfo: (data: TUpdateUserInfoInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 사용자 정보 수정: update [react-query mutation]
 * @returns {TUseUpdateUserInfoOutput} 사용자 정보 수정 결과
 */
export const useUpdateUserInfo = (): TUseUpdateUserInfoOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TUpdateUserInfoOutput, AxiosError, TUpdateUserInfoInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.UPDATE_USER_INFO,
      status: 'U',
    }),
    mutationFn: fetchUpdateUserInfo,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.FIND_USER_INFO);
        },
      });
    },
  });

  /**
   * * 사용자 정보 수정 함수
   * @param {TUpdateUserInfoInput} input 사용자 정보 수정 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 사용자 정보 수정 결과
   */
  const onUpdateUserInfo = async (input: TUpdateUserInfoInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '사용자 정보가 수정되었습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '사용자 정보 수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onUpdateUserInfo };
};
