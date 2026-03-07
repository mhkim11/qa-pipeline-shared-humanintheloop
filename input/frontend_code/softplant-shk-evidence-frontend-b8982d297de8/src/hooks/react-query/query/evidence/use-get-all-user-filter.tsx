import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { EVIDENCE_ADMIN_QUERY_KEY, fetchFindCreateEvidenceFilter } from '@/apis';
import type { TGetAllUserFilterInput, TGetAllUserFilterOutput } from '@/apis/type';

type TUseGetAllUserFilterParams = TGetAllUserFilterInput & {
  enabled?: boolean;
};

type TUseGetAllUserFilterOutput = {
  response?: TGetAllUserFilterOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

/**
 * * 어드민 전체 사용자 목록 - 필터 옵션 조회 react-query query hook
 * @param input - 필터 조건(선택된 값/범위) 기반으로 사용 가능한 옵션을 조회
 */
export const useGetAllUserFilter = (input: TUseGetAllUserFilterParams): TUseGetAllUserFilterOutput => {
  const isEnabled = input.enabled !== false;

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetAllUserFilterOutput, AxiosError>({
    queryKey: [EVIDENCE_ADMIN_QUERY_KEY.FIND_CREATE_EVIDENCE_FILTER, input],
    queryFn: async () => {
      return await fetchFindCreateEvidenceFilter(input);
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
    console.error('GetAllUserFilter Query Error:', error);
  }

  return { response, error, isFetching, refetch, isLoading };
};
