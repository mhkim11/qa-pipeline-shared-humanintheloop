import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchAssignLawyerToCase, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TAssignLawyerToCaseInput, TAssignLawyerToCaseOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseAssignLawyerToCaseOutput = {
  isPending: boolean;
  onAssignLawyerToCase: (data: TAssignLawyerToCaseInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 사건에 로펌 사용자 배정: create [react-query mutation]
 * @returns {TUseAssignLawyerToCaseOutput} 사건에 로펌 사용자 배정 결과
 */
export const useAssignLawyerToCase = (): TUseAssignLawyerToCaseOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TAssignLawyerToCaseOutput, AxiosError, TAssignLawyerToCaseInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_ADMIN_QUERY_KEY.ASSIGN_LAWYER_TO_CASE,
      status: 'I',
    }),
    mutationFn: fetchAssignLawyerToCase,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_ADMIN_QUERY_KEY.FIND_CASE);
        },
      });
    },
  });

  /**
   * * 사건에 로펌 사용자 배정 함수
   * @param {TAssignLawyerToCaseInput} input 사건에 로펌 사용자 배정 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 사건에 로펌 사용자 배정 결과
   */
  const onAssignLawyerToCase = async (input: TAssignLawyerToCaseInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '사용자 권한이 부여되었습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '사용자 권한 부여에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onAssignLawyerToCase };
};
