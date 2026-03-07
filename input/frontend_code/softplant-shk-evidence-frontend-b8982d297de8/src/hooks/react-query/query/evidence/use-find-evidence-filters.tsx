import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListEvidenceFilter, EVIDENCE_QUERY_KEY } from '@/apis';
import { fetchListEvidenceDemoFilter } from '@/apis/demo-api';
import { TListDemoEvidenceFilterOutput, TListEvidenceFilterOutput } from '@/apis/type';

type TUseEvidenceFilterInput = {
  project_id: string;
  keyword: string;
  filters: { key: string[]; value: string[] };
};

type TUseEvidenceFilterOutput = {
  response?: TListEvidenceFilterOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

type TUseEvidenceFilterDemoOutput = {
  response?: TListDemoEvidenceFilterOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 증거목록 필터 react-query query hook
 * @param {TUseEvidenceFilterInput} input 필터 조회 조건
 * @returns {TUseEvidenceFilterOutput} output 필터 조회 결과
 */
export const useEvidenceFilter = ({ project_id }: TUseEvidenceFilterInput): TUseEvidenceFilterOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListEvidenceFilterOutput, AxiosError>({
    queryKey: [EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE_FILTER, project_id],
    queryFn: async () => {
      const result = await fetchListEvidenceFilter({
        project_id,
        keyword: '',
        filters: {
          key: ['name', 'reference', 'category'],
          value: [],
        },
      });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Evidence Filter Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};

/**
 * * DEMO: 증거목록 필터 react-query query hook
 * - /evidences/demo/filter 사용 (로그인/토큰 없이 호출 가능하도록 별도 endpoint)
 */
export const useEvidenceFilterDemo = ({ project_id }: TUseEvidenceFilterInput): TUseEvidenceFilterDemoOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListDemoEvidenceFilterOutput, AxiosError>({
    queryKey: [EVIDENCE_QUERY_KEY.FIND_LIST_EVIDENCE_FILTER, project_id, 'demo'],
    queryFn: async () => {
      const result = await fetchListEvidenceDemoFilter({
        project_id,
        keyword: '',
        filters: {
          key: ['name', 'reference', 'category'],
          value: [],
        },
      });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Evidence Filter (DEMO) Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
