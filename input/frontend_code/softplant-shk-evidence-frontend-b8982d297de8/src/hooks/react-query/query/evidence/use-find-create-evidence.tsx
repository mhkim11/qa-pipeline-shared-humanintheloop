import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchFindCreateEvidence, EVIDENCE_ADMIN_QUERY_KEY } from '@/apis';
import { TFindCreateEvidenceOutput } from '@/apis/type';
import { paginationQueryKeyMaker } from '@/components/utils';

type TUseFindCreateEvidenceInput = {
  office_id: string;
  project_id: string;
  page_no: number | string;
  block_cnt: number | string;
  keyword?: string;
  upload_version?: string | null;
};

type TUseFindCreateEvidenceOutput = {
  response?: TFindCreateEvidenceOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useFindCreateEvidence = ({
  office_id,
  project_id,
  page_no,
  block_cnt,
  keyword,
  upload_version,
}: TUseFindCreateEvidenceInput): TUseFindCreateEvidenceOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindCreateEvidenceOutput, AxiosError>({
    queryKey: paginationQueryKeyMaker({
      queryKeyName: EVIDENCE_ADMIN_QUERY_KEY.FIND_CREATE_EVIDENCE,
      pageSize: String(block_cnt),
      otherQueryParams: {
        project_id,
        office_id,
        page_no: String(page_no),
        block_cnt: String(block_cnt),
        keyword: keyword || '',
        upload_version: upload_version || '',
      },
    }),
    queryFn: async () => {
      const result = await fetchFindCreateEvidence({ project_id, office_id, page_no, block_cnt, keyword, upload_version });
      return result;
    },
    enabled: project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
