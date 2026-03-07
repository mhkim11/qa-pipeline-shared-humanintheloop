import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListRecentEvidences, EVIDENCE_QUERY_KEY } from '@/apis';
import { TListRecentEvidencesOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListRecentEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

type TUseListRecentEvidencesOutput = {
  response?: TListRecentEvidencesOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 최근 본 증거 리스트 조회 react-query hook
 * @param {TUseListRecentEvidencesInput} input 조회 조건
 * @returns {TUseListRecentEvidencesOutput} 최근 본 증거 리스트 조회 결과
 */
export const useListRecentEvidences = ({ project_id, page, limit }: TUseListRecentEvidencesInput): TUseListRecentEvidencesOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListRecentEvidencesOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_RECENT_EVIDENCES,
      pageSize: limit.toString(),
      otherQueryParams: { project_id },
    }),
    queryFn: async () => {
      const result = await fetchListRecentEvidences({ project_id, page, limit });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
