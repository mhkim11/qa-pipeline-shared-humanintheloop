import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListBookmarkedEvidences, EVIDENCE_QUERY_KEY } from '@/apis';
import { TListBookmarkedEvidencesOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListBookmarkedEvidencesInput = {
  project_id: string;
  page: number;
  limit: number;
};

type TUseListBookmarkedEvidencesOutput = {
  response?: TListBookmarkedEvidencesOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 북마크된 증거 리스트 조회 react-query hook
 * @param {TUseListBookmarkedEvidencesInput} input 조회 조건
 * @returns {TUseListBookmarkedEvidencesOutput} 북마크된 증거 리스트 조회 결과
 */
export const useListBookmarkedEvidences = ({
  project_id,
  page,
  limit,
}: TUseListBookmarkedEvidencesInput): TUseListBookmarkedEvidencesOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListBookmarkedEvidencesOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FINE_BOOKMARKED_EVIDENCES,
      pageSize: limit.toString(),
      otherQueryParams: { project_id },
    }),
    queryFn: async () => {
      const result = await fetchListBookmarkedEvidences({ project_id, page, limit });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
