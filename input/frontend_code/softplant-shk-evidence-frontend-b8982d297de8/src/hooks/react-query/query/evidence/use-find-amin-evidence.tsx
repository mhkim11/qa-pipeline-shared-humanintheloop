import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindOrigenalEvidence, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindEvidenceOriginalOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindEvidenceInput = {
  office_id: string;
  project_id: string;
  page_no: number;
  block_cnt: number;
};

type TUseFindORiginalEvidenceOutput = {
  response?: TFindEvidenceOriginalOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 원본파일 리스트 검색 react-query query hook
 * @param {TUseFindEvidenceInput} input 검색 조건
 * @returns {TUseFindEvidenceOutput} output 증거 검색 결과
 */
export const useFindOriginalEvidence = ({
  office_id,
  project_id,
  page_no,
  block_cnt,
}: TUseFindEvidenceInput): TUseFindORiginalEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,

    isLoading,
  } = useQuery<TFindEvidenceOriginalOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_ADMIN_QUERY_KEY.FIND_ORIGINAL_EVIDENCE,
      pageSize: block_cnt.toString(),
      otherQueryParams: { project_id },
    }),
    queryFn: () => fetchFindOrigenalEvidence({ office_id, project_id, page_no, block_cnt }),
    enabled: project_id !== '',
  });
  return { response, error, isFetching, refetch, isLoading };
};
