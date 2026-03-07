import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchFindAllAdminCaseList } from '@/apis';
import { TFindAllAdminCaseListInput, TFindAllAdminCaseListOutput } from '@/apis/type';

type TUseFindAllAdminCaseListOutput = {
  response: TFindAllAdminCaseListOutput | undefined;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 관리자 전체 사건목록 조회 react-query query hook
 * @param {TFindAllAdminCaseListInput} input - 사건목록 조회 파라미터
 * @returns {TUseFindAllAdminCaseListOutput} 관리자 전체 사건목록 조회 결과
 */
export const useFindAllAdminCaseList = (input: TFindAllAdminCaseListInput): TUseFindAllAdminCaseListOutput => {
  const {
    data: response,
    error,
    isFetching: _isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindAllAdminCaseListOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_ALL_ADMIN_CASE_LIST, input],
    queryFn: () => fetchFindAllAdminCaseList(input),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnMount: 'always',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error: error || null, refetch, isLoading };
};
