import { useQuery } from '@tanstack/react-query';

import { fetchGetRequestList } from '@/apis/case-api/request-api';
import type { TRequestListInput, TRequestListOutput } from '@/apis/type/case-type/request-type';

import type { AxiosError } from 'axios';

type TUseGetRequestListParams = {
  input?: TRequestListInput | null;
  enabled?: boolean;
};

type TUseGetRequestListOutput = {
  response?: TRequestListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetRequestList = ({ input, enabled = true }: TUseGetRequestListParams): TUseGetRequestListOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TRequestListOutput, AxiosError>({
    queryKey: ['evidence-request', 'list', input?.civil_case_id ?? '', JSON.stringify(input ?? {})],
    queryFn: () => fetchGetRequestList(input as TRequestListInput),
    enabled: enabled && !!input?.civil_case_id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error: error ?? null, isFetching, refetch, isLoading };
};
