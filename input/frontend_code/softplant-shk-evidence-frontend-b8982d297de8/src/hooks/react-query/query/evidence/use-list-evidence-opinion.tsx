import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_QUERY_KEY, fetchListEvidenceOpinion } from '@/apis';
import type { TListEvidenceOpinionInput, TListEvidenceOpinionOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseListEvidenceOpinionInput = TListEvidenceOpinionInput & {
  enabled?: boolean;
};

type TUseListEvidenceOpinionOutput = {
  response?: TListEvidenceOpinionOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 증거인부 목록조회 react-query query hook
 */
export const useListEvidenceOpinion = ({
  project_id,
  page_no,
  block_cnt,
  enabled = true,
}: TUseListEvidenceOpinionInput): TUseListEvidenceOpinionOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListEvidenceOpinionOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_QUERY_KEY.LIST_EVIDENCE_OPINION,
      pageSize: String(block_cnt),
      otherQueryParams: { project_id, page_no: String(page_no), block_cnt: String(block_cnt) },
    }),
    queryFn: () => fetchListEvidenceOpinion({ project_id, page_no, block_cnt }),
    enabled: enabled && project_id !== '',
  });

  if (error) console.error('Query Error:', error);

  return { response, error, isFetching, refetch, isLoading };
};
