import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetEvidenceTag, EVIDENCE_QUERY_KEY } from '@/apis';
import { TGetEvidenceTagOutput } from '@/apis/type';

type TUseGetEvidenceTagInput = {
  tag_id: string;
  enabled?: boolean;
};

type TUseGetEvidenceTagOutput = {
  response?: TGetEvidenceTagOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 태그 상세조회 react-query query hook
 * @param {TUseGetEvidenceTagInput} input 태그 ID
 * @returns {TUseGetEvidenceTagOutput} output 태그 상세조회 결과
 */
export const useGetEvidenceTag = ({ tag_id, enabled = true }: TUseGetEvidenceTagInput): TUseGetEvidenceTagOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetEvidenceTagOutput, AxiosError>({
    queryKey: [EVIDENCE_QUERY_KEY.GET_EVIDENCE_TAG, tag_id],
    queryFn: () => fetchGetEvidenceTag({ tag_id }),
    enabled: enabled && tag_id !== '',
  });

  if (error) {
    console.error('Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
