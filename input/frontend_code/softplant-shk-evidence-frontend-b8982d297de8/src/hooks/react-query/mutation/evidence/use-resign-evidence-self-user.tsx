import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchResignSelf, EVIDENCE_QUERY_KEY } from '@/apis';
import { useResignSelfSchema } from '@/apis/schema';
import { TResignSelfInput, TResignSelfOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseResignEvidenceSelfUserOutput = {
  isPending: boolean;
  onResignEvidenceSelfUser: (data: TResignSelfInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 사용자 자기 퇴사 처리 : create [react-query mutation]
 * @returns {TUseResignEvidenceSelfUserOutput} 사용자 자기 퇴사 처리 결과
 */
export const useResignEvidenceSelfUser = (): TUseResignEvidenceSelfUserOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending: isPending } = useMutation<TResignSelfOutput, AxiosError, TResignSelfInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.RESIGN_SELF,
      status: 'D',
    }),
    mutationFn: fetchResignSelf,
    onSuccess: async (_response) => {
      // DELETE 성공 후 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: [EVIDENCE_QUERY_KEY.FIND_LIST_PROJECT], // 프로젝트 리스트 캐시 무효화
      });

      // 필요한 경우 다른 쿼리도 무효화
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.RESIGN_SELF),
      });
    },
  });

  /**
   * * 사용자 자기 퇴사 처리 함수
   * @param {TResignSelfInput} input 자기 퇴사 처리 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 자기 퇴사 처리 결과
   */
  const onResignEvidenceSelfUser = async (input: TResignSelfInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useResignSelfSchema.safeParse(input);

    // 유효성 검사를 통과하지 못한 경우 오류를 처리합니다.
    if (!parsedInput.success) {
      return {
        isSuccess: false,
        message: '유효성 검사에 실패했습니다. 입력한 데이터를 다시 확인해주세요.',
      };
    }

    try {
      // 퇴사 처리 요청
      const response = await mutateAsync(parsedInput.data);

      if (!response || !response.success) {
        throw new Error(response?.message || '자기 퇴사 처리에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '자기 퇴사 처리가 완료되었습니다.' };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || error?.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';

      return { isSuccess: false, message: errorMessage };
    }
  };

  return { isPending, onResignEvidenceSelfUser };
};
