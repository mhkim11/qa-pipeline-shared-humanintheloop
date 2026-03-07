import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetRequestDraftByTarget } from '@/apis/case-api/request-api';
import type { TRequestDraftByTargetInput, TRequestDraftByTargetOutput } from '@/apis/type/case-type/request-type';

type TUseGetRequestDraftByTargetParams = {
  targetType?: 'CLIPPING' | 'MESSAGE' | null;
  targetId?: string | null;
  enabled?: boolean;
};

type TUseGetRequestDraftByTargetOutput = {
  response?: TRequestDraftByTargetOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetRequestDraftByTarget = ({
  targetType,
  targetId,
  enabled = true,
}: TUseGetRequestDraftByTargetParams): TUseGetRequestDraftByTargetOutput => {
  const input: TRequestDraftByTargetInput | null =
    targetType && targetId
      ? {
          target_type: targetType,
          target_id: targetId,
        }
      : null;

  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TRequestDraftByTargetOutput, AxiosError>({
    queryKey: ['evidence-request', 'draft-by-target', targetType ?? '', targetId ?? ''],
    queryFn: () => fetchGetRequestDraftByTarget(input as TRequestDraftByTargetInput),
    enabled: enabled && !!input,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
