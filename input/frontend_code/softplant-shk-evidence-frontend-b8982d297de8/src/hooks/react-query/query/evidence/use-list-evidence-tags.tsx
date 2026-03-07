import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchListEvidenceTags, EVIDENCE_QUERY_KEY } from '@/apis';
import { TListEvidenceTagsOutput } from '@/apis/type';

type TUseListEvidenceTagsInput = {
  project_id: string;
  enabled?: boolean;
};

type TUseListEvidenceTagsOutput = {
  response?: TListEvidenceTagsOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 태그 목록조회 react-query query hook
 * @param {TUseListEvidenceTagsInput} input 프로젝트 ID
 * @returns {TUseListEvidenceTagsOutput} output 태그 목록조회 결과
 */
export const useListEvidenceTags = ({ project_id, enabled = true }: TUseListEvidenceTagsInput): TUseListEvidenceTagsOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TListEvidenceTagsOutput, AxiosError>({
    queryKey: [EVIDENCE_QUERY_KEY.LIST_EVIDENCE_TAGS, project_id],
    queryFn: () => fetchListEvidenceTags({ project_id }),
    enabled: enabled && project_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
