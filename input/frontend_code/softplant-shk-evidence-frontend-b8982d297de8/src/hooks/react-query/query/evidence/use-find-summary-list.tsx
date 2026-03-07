import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindSummaryResultList, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindSummaryListOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindSummaryResultListInput = {
  office_id: string;
  project_id: string;
  page_no?: number;
  block_cnt?: string;
};

type TUseFindSummaryResultListOutput = {
  response?: TFindSummaryListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 요약 결과 리스트 조회 react-query query hook
 * @param {TUseFindSummaryResultListInput} input 검색 조건
 * @returns {TUseFindSummaryResultListOutput} output 요약 결과 리스트 조회 결과
 */
export const useFindSummaryResultList = ({
  office_id,
  project_id,

  block_cnt,
}: TUseFindSummaryResultListInput): TUseFindSummaryResultListOutput => {
  const resolvedBlockCnt = Number(block_cnt ?? 1000) || 1000;
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindSummaryListOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_ADMIN_QUERY_KEY.FIND_SUMMARY_RESULT_LIST,
      pageSize: String(resolvedBlockCnt),
      otherQueryParams: { project_id, office_id },
    }),
    queryFn: async () => {
      const result = await fetchFindSummaryResultList({ project_id, office_id, block_cnt: resolvedBlockCnt });
      return result;
    },
    enabled: project_id !== '',
    // StrictMode(DEV) 마운트 2회로 인한 중복 호출 방지 + 불필요한 자동 재호출 방지
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
