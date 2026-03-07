import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListMemoedEvidences, EVIDENCE_QUERY_KEY } from '@/apis';
import { TListMemoedEvidencesOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListMemoedEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

type TUseListMemoedEvidencesOutput = {
  response?: TListMemoedEvidencesOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 메모된 증거 리스트 조회 react-query hook
 * @param {TUseListMemoedEvidencesInput} input 조회 조건
 * @returns {TUseListMemoedEvidencesOutput} 메모된 증거 리스트 조회 결과
 */
export const useListMemoedEvidences = ({ project_id, page, limit }: TUseListMemoedEvidencesInput): TUseListMemoedEvidencesOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListMemoedEvidencesOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_MEMOED_EVIDENCES,
      pageSize: limit.toString(),
      otherQueryParams: { project_id },
    }),
    queryFn: async () => {
      const result = await fetchListMemoedEvidences({ project_id, page, limit });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
