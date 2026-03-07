import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindCase, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindCaseOutput } from '@/apis/type';

type TUseFindCaseOutput = {
  response?: TFindCaseOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 사건 조회 react-query query hook
 * @param project_id - 프로젝트 ID
 * @returns {TUseFindCaseOutput} 사건 조회 결과
 */
export const useFindCase = (project_id: string): TUseFindCaseOutput => {
  const {
    data: caseData,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindCaseOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_CASE, project_id],
    queryFn: () => fetchFindCase(project_id),
    enabled: !!project_id,
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response: caseData, error, isFetching, refetch, isLoading };
};
