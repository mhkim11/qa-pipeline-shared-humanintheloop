import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetClippingListForEvidenceRequest } from '@/apis/case-api/cliping-api';
import type { TGetClippingListOutput } from '@/apis/type/case-type/cliping.type';

type TUseGetClippingListForEvidenceRequestParams = {
  civilCaseId?: string | null;
  status?: string;
  enabled?: boolean;
};

type TUseGetClippingListForEvidenceRequestOutput = {
  response?: TGetClippingListOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetClippingListForEvidenceRequest = ({
  civilCaseId,
  status = 'all',
  enabled = true,
}: TUseGetClippingListForEvidenceRequestParams): TUseGetClippingListForEvidenceRequestOutput => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TGetClippingListOutput, AxiosError>({
    queryKey: ['civil-case', 'clipping-list-for-evidence-request', civilCaseId ?? '', status],
    queryFn: () => fetchGetClippingListForEvidenceRequest(String(civilCaseId), status),
    enabled: enabled && !!civilCaseId,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
