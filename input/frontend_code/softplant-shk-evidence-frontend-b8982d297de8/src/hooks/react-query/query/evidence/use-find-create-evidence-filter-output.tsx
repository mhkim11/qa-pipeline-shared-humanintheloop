import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchFindCreateEvidenceFilterOutput } from '@/apis';
import type { TFindCreateEvidenceFilterInput, TFindCreateEvidenceFilterOutput } from '@/apis/type';

type TUseFindCreateEvidenceFilterOutputParams = TFindCreateEvidenceFilterInput & {
  enabled?: boolean;
};

type TUseFindCreateEvidenceFilterOutput = {
  response?: TFindCreateEvidenceFilterOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 어드민 증거문서 생성조회 - 필터 옵션 조회 react-query query hook
 */
export const useFindCreateEvidenceFilterOutput = (input: TUseFindCreateEvidenceFilterOutputParams): TUseFindCreateEvidenceFilterOutput => {
  const isEnabled = input.enabled !== false;

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TFindCreateEvidenceFilterOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_CREATE_EVIDENCE_FILTER_OUTPUT, input],
    queryFn: async () => {
      return await fetchFindCreateEvidenceFilterOutput(input);
    },
    enabled: isEnabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  if (error) {
    console.error('FindCreateEvidenceFilterOutput Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
