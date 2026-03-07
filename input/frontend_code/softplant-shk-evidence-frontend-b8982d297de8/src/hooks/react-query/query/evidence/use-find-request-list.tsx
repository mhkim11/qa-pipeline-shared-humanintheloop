import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchJoinProjectRequestList, EVIDENCE_QUERY_KEY } from '@/apis';
import { TJoinProjectRequestListInput, TJoinProjectRequestListOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseJoinRequestListOutput = {
  response?: TJoinProjectRequestListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 권한 요청 목록 react-query query hook
 * @param {TUseJoinRequestListInput} input 권한 요청 조건
 * @returns {TUseJoinRequestListOutput} output 권한 요청 목록 결과
 */
export const useJoinRequestList = ({ page_no, block_cnt, status }: TJoinProjectRequestListInput): TUseJoinRequestListOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TJoinProjectRequestListOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FIND_JOIN_PROJECT_REQUEST,
      pageSize: block_cnt.toString(),
      otherQueryParams: { page_no: page_no.toString(), status },
    }),
    queryFn: async () => {
      const result = await fetchJoinProjectRequestList({ page_no, block_cnt, status });
      return result;
    },
    enabled: page_no > 0 && block_cnt > 0,
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
