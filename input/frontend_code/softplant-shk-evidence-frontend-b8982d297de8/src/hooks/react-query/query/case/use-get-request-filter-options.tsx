import { useQuery } from '@tanstack/react-query';

import { fetchGetRequestFilterOptions } from '@/apis/case-api/request-api';
import type { TRequestFilterOptionsOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestFilterOptionsParams = {
  civilCaseId?: string | null;
  enabled?: boolean;
};

type TUseGetRequestFilterOptionsOutput = {
  response?: TRequestFilterOptionsOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetRequestFilterOptions = ({
  civilCaseId,
  enabled = true,
}: TUseGetRequestFilterOptionsParams): TUseGetRequestFilterOptionsOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TRequestFilterOptionsOutput, AxiosError>({
    queryKey: ['evidence-request', 'filter-options', civilCaseId ?? ''],
    queryFn: () => fetchGetRequestFilterOptions(String(civilCaseId)),
    enabled: enabled && !!civilCaseId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error: error ?? null, isFetching, refetch, isLoading };
};
