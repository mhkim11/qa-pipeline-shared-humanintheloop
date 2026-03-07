import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindMatchingList, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindMatchingListOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindEvidenceInput = {
  office_id: string;
  project_id: string;
  page_no: number | string;
  block_cnt: number | string;
};

type TUseFindEvidenceOutput = {
  response?: TFindMatchingListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 증거 검색 react-query query hook
 * @param {TUseFindEvidenceInput} input 검색 조건
 * @returns {TUseFindEvidenceOutput} output 증거 검색 결과
 */
export const useFindMatchingList = ({ office_id, project_id, page_no, block_cnt }: TUseFindEvidenceInput): TUseFindEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindMatchingListOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_ADMIN_QUERY_KEY.FIND_MATCHING_LIST,
      pageSize: String(block_cnt),
      otherQueryParams: { project_id, office_id, page_no: String(page_no), block_cnt: String(block_cnt) },
    }),
    queryFn: async () => {
      const result = await fetchFindMatchingList({ project_id, office_id, page_no, block_cnt });

      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
