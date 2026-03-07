import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListEvidence, EVIDENCE_QUERY_KEY } from '@/apis';
import { fetchListEvidenceDemo } from '@/apis/demo-api';
import { TListDemoEvidenceOutput, TListEvidenceOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListEvidenceInput = {
  project_id: string;
  keyword: string;
  page: number | string;
  limit: number | string;
  not_contain?: string[];
  power_search?: string;
  filters?: {
    name: string[];
    reference: string[];
    category: string[];
    bookmark: string[];
    memo: string[];
    summary: string[];
    missing_page: string[];
    tags?: string[];
    opinion?: string[];
  };
  sort_column?: string;
  sort_direction?: 'asc' | 'desc';
};

type TUseListEvidenceOutput = {
  response?: TListEvidenceOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

type TUseListEvidenceDemoOutput = {
  response?: TListDemoEvidenceOutput;
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
export const useListEvidence = ({
  project_id,
  page,
  keyword,
  limit,
  power_search,
  not_contain,
  filters,
  sort_column,
  sort_direction,
}: TUseListEvidenceInput): TUseListEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListEvidenceOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE,
      pageSize: limit.toString(),
      otherQueryParams: { project_id, page: String(page) },
    }),
    queryFn: () =>
      fetchListEvidence({
        project_id,
        page,
        limit,
        keyword,
        power_search,
        not_contain,
        filters,
        sort_column,
        sort_direction,
      }),
    enabled: project_id !== '',
  });
  return { response, error, isFetching, refetch, isLoading };
};

/**
 * * DEMO: 증거 리스트 react-query query hook
 * - /evidences/demo/list 사용 (로그인/토큰 없이 호출 가능하도록 별도 endpoint)
 */
export const useListEvidenceDemo = ({
  project_id,
  page,
  keyword,
  limit,
  power_search,
  not_contain,
  filters,
  sort_column,
  sort_direction,
}: TUseListEvidenceInput): TUseListEvidenceDemoOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListDemoEvidenceOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE,
      pageSize: limit.toString(),
      otherQueryParams: { project_id, page: String(page), demo: '1' },
    }),
    queryFn: () =>
      fetchListEvidenceDemo({
        project_id,
        page,
        limit,
        keyword,
        power_search,
        not_contain,
        filters,
        sort_column,
        sort_direction,
      }),
    enabled: project_id !== '',
  });
  return { response, error, isFetching, refetch, isLoading };
};
