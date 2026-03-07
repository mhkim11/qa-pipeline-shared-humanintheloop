import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { fetchGetMessageDraft } from '@/apis/case-api/request-api';
import type { TMessageDraftOutput } from '@/apis/type/case-type/request-type';

type TUseGetMessageDraftParams = {
  civilCaseId?: string | null;
  enabled?: boolean;
};

type TUseGetMessageDraftOutputHook = {
  response?: TMessageDraftOutput;
  isFetching: boolean;
  isLoading: boolean;
  error: AxiosError | null;
  refetch: () => void;
};

export const useGetMessageDraft = ({ civilCaseId, enabled = true }: TUseGetMessageDraftParams): TUseGetMessageDraftOutputHook => {
  const {
    data: response,
    error,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<TMessageDraftOutput, AxiosError>({
    queryKey: ['evidence-request', 'message-draft', civilCaseId ?? ''],
    queryFn: () => fetchGetMessageDraft({ civil_case_id: civilCaseId! }),
    enabled: enabled && !!civilCaseId,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: false,
  });

  return { response, error, isFetching, refetch, isLoading };
};
