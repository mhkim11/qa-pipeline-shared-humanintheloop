import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindEvidence, EVIDENCE_QUERY_KEY } from '@/apis';
import { TFindEvidenceOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindEvidenceInput = {
  project_id: string;
  searchQuery: { text: string; operator: 'AND' | 'OR' }[];
  page: number | string;
  titleFilters: {
    type: string;
    text: string;
    operator: 'AND' | 'OR';
    field: string;
    caseSensitive: boolean;
  }[]; // 배열 형태로 수정
  limit: number;
};

type TUseFindEvidenceOutput = {
  response?: TFindEvidenceOutput;
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
export const useFindEvidence = ({ project_id, searchQuery, page, limit, titleFilters }: TUseFindEvidenceInput): TUseFindEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindEvidenceOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FIND_EVIDENCE,
      pageSize: limit.toString(),
      otherQueryParams: { project_id, searchQuery: JSON.stringify(searchQuery), titleFilters: JSON.stringify(titleFilters) },
    }),
    queryFn: async () => {
      const result = await fetchFindEvidence({ project_id, searchQuery, page, limit, titleFilters });

      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error); // 에러 로그 출력
  }

  return { response, error, isFetching, refetch, isLoading };
};
