import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchModifyProject, EVIDENCE_QUERY_KEY } from '@/apis';
import { TEditProjectInput, TEditProjectOutput, TMutationOutput } from '@/apis/type';
import { mutationKeyMaker } from '@/components/utils';

type TUseModifyProjectOutput = {
  isPending: boolean;
  onModifyProject: (data: TEditProjectInput) => Promise<TMutationOutput | undefined>;
};

/**
 * * 프로젝트 정보 수정: update [react-query mutation]
 * @returns {TUseModifyProjectOutput} 프로젝트 정보 수정 결과
 */
export const useModifyProject = (): TUseModifyProjectOutput => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<TEditProjectOutput, AxiosError, TEditProjectInput>({
    mutationKey: mutationKeyMaker({
      mutationKeyName: EVIDENCE_QUERY_KEY.MODIFY_PROJECT,
      status: 'U',
    }),
    mutationFn: fetchModifyProject,
    onSuccess: async (_response) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(EVIDENCE_QUERY_KEY.FIND_LIST_PROJECT);
        },
      });
    },
  });

  /**
   * * 프로젝트 정보 수정 함수
   * @param {TEditProjectInput} input 프로젝트 정보 수정 입력 데이터
   * @returns {Promise<TMutationOutput | undefined>} 프로젝트 정보 수정 결과
   */
  const onModifyProject = async (input: TEditProjectInput): Promise<TMutationOutput | undefined> => {
    try {
      const response = await mutateAsync(input);

      // 성공 여부 체크
      if (response?.success) {
        return {
          isSuccess: true,
          message: response.message || '프로젝트 정보가 수정되었습니다.',
        };
      }

      // 실패 시 에러 반환
      return {
        isSuccess: false,
        message: response?.message || '프로젝트 정보 수정에 실패했습니다.',
      };
    } catch (error: any) {
      return {
        isSuccess: false,
        message: error.message || '서버 오류가 발생했습니다.',
      };
    }
  };

  return { isPending, onModifyProject };
};
