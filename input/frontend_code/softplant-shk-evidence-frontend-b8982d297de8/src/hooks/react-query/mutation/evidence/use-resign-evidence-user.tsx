import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchResignUser, EVIDENCE_QUERY_KEY } from '@/apis';
import { useResignSchema } from '@/apis/schema';
import { TResignUserInput, TResignUserOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseResignEvidenceUserOutput = {
  isPending: boolean;
  onResignEvidenceUser: (data: TResignUserInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 사용자 퇴사 처리 : create [react-query mutation]
 * @returns {TUseResignEvidenceUserOutput} 사용자 퇴사 처리 결과
 */
export const useResignEvidenceUser = (): TUseResignEvidenceUserOutput => {
  // - useQueryClient 모음
  const queryClient = useQueryClient();

  // - useMutation 모음
  const { mutateAsync, isPending: isPending } = useMutation<TResignUserOutput, AxiosError, TResignUserInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.RESIGN_USER,
      status: 'D',
    }),
    mutationFn: fetchResignUser,
    onSuccess: async (_response) => {
      // DELETE 성공 후 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: [EVIDENCE_QUERY_KEY.FIND_LIST_PROJECT], // 프로젝트 리스트 캐시 무효화
      });

      // 필요한 경우 다른 쿼리도 무효화
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.includes(EVIDENCE_QUERY_KEY.RESIGN_USER),
      });
    },
  });

  /**
   * * 사용자 퇴사 처리 함수
   * @param {TResignUserInput} input 퇴사 처리 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 퇴사 처리 결과
   */
  const onResignEvidenceUser = async (input: TResignUserInput): Promise<TMutationOutput | undefined> => {
    const parsedInput = useResignSchema.safeParse(input);

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
        throw new Error(response?.message || '사용자 퇴사 처리에 실패했습니다.');
      }

      return { isSuccess: true, message: response?.message || '사용자 퇴사 처리가 완료되었습니다.' };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message || error?.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';

      return { isSuccess: false, message: errorMessage };
    }
  };

  return { isPending, onResignEvidenceUser };
};
